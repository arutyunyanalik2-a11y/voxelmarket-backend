import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv

# Загружаем переменные из файла .env
load_dotenv()

# Инициализируем Flask приложение
app = Flask(__name__)
CORS(app)

# Получаем ключ из .env
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Не найден GEMINI_API_KEY в файле .env")

# Инициализируем новый клиент Google GenAI
client = genai.Client(api_key=API_KEY)

# Системная инструкция для мини-Захара
SYSTEM_INSTRUCTION = (
    "Ты — Захар, интеллектуальный ИИ-ассистент экосистемы Voxel Rivo и платформы Voxel Market. "
    "Твоя задача — вежливо, кратко и по делу отвечать на вопросы пользователей. "
    "Ты помогаешь клиентам ориентироваться на маркетплейсе, отвечаешь на вопросы о технологиях, 3D-печати и покупках."
)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message')

        if not user_message:
            return jsonify({"error": "Пустое сообщение"}), 400

        # Запрос через новый клиент с передачей системной инструкции в конфиге
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_message,
            config={
                'system_instruction': SYSTEM_INSTRUCTION
            }
        )

        return jsonify({
            "reply": response.text
        })

    except Exception as e:
        print(f"Ошибка при обработке запроса: {e}")
        return jsonify({"error": "Внутренняя ошибка сервера"}), 500

# Запуск локального сервера
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)