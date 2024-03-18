from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.core import serializers
from app.models import Quiz
from uuid import UUID
import json
import random

def is_valid_uuid(uuid_to_test, version=4):
    """
    Check if uuid_to_test is a valid UUID.
    
     Parameters
    ----------
    uuid_to_test : str
    version : {1, 2, 3, 4}
    
     Returns
    -------
    `True` if uuid_to_test is a valid UUID, otherwise `False`.
    
     Examples
    --------
    >>> is_valid_uuid('c9bf9e57-1685-4c89-bafb-ff5af830be8a')
    True
    >>> is_valid_uuid('c9bf9e58')
    False
    """
    
    try:
        uuid_obj = UUID(uuid_to_test, version=version)
    except ValueError:
        return False
    return str(uuid_obj) == uuid_to_test

def generate_questions(config):
    # 1. Get the number of questions to generate
    questions_count = config['questions']
    # 2. Get the types of math questions to generate
    math_types = config['mathTypes']
    # 3. Determine if questions should be shuffled
    shuffle_questions = config['shuffle']
    # 4. Determine the difficulty level, default to easy if not specified
    difficulty = config.get('difficulty', 1)
    # 5. Initialize an empty list to store generated questions
    questions = []

    # Define number ranges based on difficulty
    if difficulty == 1:  # Easy
        addition_subtraction_range = (1, 20)
        multiplication_division_range = (1, 6)
    elif difficulty == 2:  # Normal
        addition_subtraction_range = (10, 50)
        multiplication_division_range = (2, 9)
    elif difficulty == 3:  # Hard
        addition_subtraction_range = (20, 100)
        multiplication_division_range = (2, 9)

    # Adjust subtraction for negative answers based on difficulty
    def generate_subtraction_question():
        if difficulty == 1:  # Easy, only positive answers
            a, b = random.randint(1, 20), random.randint(1, 20)
            a, b = max(a, b), min(a, b)  # Ensure positive result
        elif difficulty == 2:  # Normal, few negative answers with small magnitudes
            if random.choice([True, False]):  # Mix of positive and some negative
                a, b = random.randint(1, 50), random.randint(1, 50)
            else:  # Ensure positive result
                a, b = random.randint(10, 50), random.randint(1, 10)
        elif difficulty == 3:  # Hard, good mix of negative and positive answers
            a, b = random.randint(20, 100), random.randint(20, 100)

        question = f"{a} - {b} = "
        answer = a - b
        return {"type": "subtraction", "question": question, "answer": answer}

    # Functions to generate each type of math question
    def generate_addition_question():
        a, b = random.randint(*addition_subtraction_range), random.randint(*addition_subtraction_range)
        question = f"{a} + {b} = "
        answer = a + b
        return {"type": "addition", "question": question, "answer": answer}

    def generate_division_question():
        b = random.randint(*multiplication_division_range)
        answer = random.randint(1, multiplication_division_range[1])
        a = b * answer
        question = f"{a} ÷ {b} = "
        return {"type": "division", "question": question, "answer": answer}

    def generate_multiplication_question():
        a, b = random.randint(*multiplication_division_range), random.randint(*multiplication_division_range)
        question = f"{a} × {b} = "
        answer = a * b
        return {"type": "multiplication", "question": question, "answer": answer}

    # Mapping types to functions
    type_function_mapping = {
        "addition": generate_addition_question,
        "subtraction": generate_subtraction_question,
        "division": generate_division_question,
        "multiplication": generate_multiplication_question,
    }

    # Generate questions
    for math_type in math_types:
        for i in range(questions_count // len(math_types)):
            question = type_function_mapping[math_type]()
            questions.append({"id": len(questions) + 1, **question})  # Add question number
    # Shuffle if needed
    if shuffle_questions:
        random.shuffle(questions)
    # Update question numbers after shuffle
    for i, question in enumerate(questions):
        question['id'] = i + 1

    # If the division of questions is not exact, handle the remaining questions
    remaining_questions = questions_count % len(math_types)
    if remaining_questions > 0:
        additional_types = math_types[:remaining_questions]
        for math_type in additional_types:
            question = type_function_mapping[math_type]()
            questions.append({"id": len(questions) + 1, **question})  # Add question number

    return questions


@login_required(login_url='/users/login')
def index(request):

    querySetQuizzes = Quiz.objects.filter(user=request.user)
    userQuizzes = serializers.serialize('json', querySetQuizzes)
    return render(request, "app/index.html", {
        "quizzes": userQuizzes
    })

@login_required(login_url='/users/login')
def quiz_history(request):

    querySetQuizzes = Quiz.objects.filter(user=request.user, unanswered='[]')
    userQuizzes = serializers.serialize('json', querySetQuizzes)
    return render(request, "app/quizhistory.html", {
        "quizzes": userQuizzes
    })

@login_required(login_url='/users/login')
def quiz_viewer(request, id):
    if is_valid_uuid(id):
        quizData = Quiz.objects.get(id=id)
        if quizData and quizData.user == request.user:
            return render(request, "app/quiz.html", {
                    "quizData": json.dumps({
                        "id": str(quizData.id),
                        "unanswered": quizData.unanswered,
                        "incorrectlyAnswered": quizData.incorrectlyAnswered or [],
                        "correctlyAnswered": quizData.correctlyAnswered or [],
                    })
            })

@login_required(login_url='/users/login')
def create_quiz(request):
    if request.method == "POST":
        # Attempt to parse JSON from the request body
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON")

        # Validate that all required fields are present
        required_fields = ['questions', 'mathTypes', 'shuffle']
        if not all(field in data for field in required_fields):
            return HttpResponseBadRequest("Missing required fields")

        # Validate specific field types
        if not isinstance(data['questions'], int) or not isinstance(data['mathTypes'], list) or not isinstance(data['shuffle'], bool):
            return HttpResponseBadRequest("Invalid field types");

        # Proceed with generating questions
        questions = generate_questions(data);
        
        quiz = Quiz(user=request.user, unanswered=questions);
        quiz.save();

        return JsonResponse({"success": True, "quizId": quiz.id})
    
    # If not POST, indicate the method is not allowed
    return HttpResponseBadRequest("Method not allowed")

@login_required(login_url='/users/login')
def submit_answer(request):
    if request.method == "POST":

                # Attempt to parse JSON from the request body
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON")

        # Validate that all required fields are present
        required_fields = ['quizId', 'answer', 'questionId']
        if not all(field in data for field in required_fields):
            return HttpResponseBadRequest("Missing required fields")

        quizData = Quiz.objects.get(id=data['quizId'])
        if quizData and quizData.user == request.user:

            if len(quizData.unanswered) == 0:
                return JsonResponse({"success": False, "message": "No more questions to answer, please reload the page, the client may have fallen out of sync with the server."})

            currentQ = quizData.unanswered[0]

            if not int(currentQ['id']) == int(data['questionId']):
                return JsonResponse({"success": False, "message": "The client has fallen out of sync with the server, please reload the page."})

            if int(data['answer']) == int(currentQ['answer']):
                if quizData.correctlyAnswered == {}:
                    quizData.correctlyAnswered = [quizData.unanswered.pop(0)]
                else:
                    quizData.correctlyAnswered.append(quizData.unanswered.pop(0))
            else:
                questionData = quizData.unanswered.pop(0)
                if quizData.incorrectlyAnswered == {}:
                    quizData.incorrectlyAnswered = [{
                        "type": questionData['type'],
                        "question": questionData['question'],
                        "answer": questionData['answer'],
                        "userAnswer": data['answer'],
                        "id": questionData['id']
                    }]
                else:
                    quizData.incorrectlyAnswered.append(
                        {
                        "type": questionData['type'],
                        "question": questionData['question'],
                        "answer": questionData['answer'],
                        "userAnswer": data['answer'],
                        "id": questionData['id']
                        }
                    )
            quizData.save()
            return JsonResponse({"success": True, "correct": int(data['answer']) == int(currentQ['answer'])})

@login_required(login_url='/users/login')
def delete_quiz(request):

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")

    # Validate that all required fields are present
    required_fields = ['quizId']
    if not all(field in data for field in required_fields):
        return HttpResponseBadRequest("Missing required fields")

    try:
        quiz = Quiz.objects.get(id=data['quizId'], user=request.user)
        quiz.delete()
        return JsonResponse({"success": True}, status=200)
    except Quiz.DoesNotExist:
        return JsonResponse({"error": "Quiz not found"}, status=404)