
import streamlit as st
import PyPDF2
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client (API key from .env file)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# -----------------------------
# Helper: Extract text from PDF
# -----------------------------
def extract_text_from_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

# -----------------------------
# Helper: Generate Questions
# -----------------------------
def generate_questions(text, num_qs, difficulty, q_type):
    prompt = f"""
    You are an assistant that creates quiz questions for teachers.
    From the following study text, generate:

    - {num_qs} questions
    - Difficulty: {difficulty}
    - Type: {q_type} (MCQs with 4 options each, True/False, or Mixed)
    - Provide output in this format:
      Q1. Question text
      Options (if MCQ): 
      a) .. b) .. c) .. d) ..
      Answer: (correct answer)

      Q2. Question text
      ...
    Do not put all answers at the end — instead include 'Answer:' just after each question.
    
    Text: {text[:3500]}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",   # fast & cost-efficient
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content

# -----------------------------
# Helper: Display Q&A nicely
# -----------------------------
def display_questions(questions_text):
    blocks = questions_text.split("Q")
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        if "Answer:" in block:
            q_part, ans_part = block.split("Answer:", 1)
            st.markdown(f"**Q{q_part.strip()}**")
            with st.expander("💡 See Answer"):
                st.markdown(ans_part.strip())
        else:
            st.markdown(f"**Q{block}**")

# -----------------------------
# Streamlit UI
# -----------------------------
st.set_page_config(page_title="Smart Quiz Generator", page_icon="📘", layout="wide")

st.title("📘 Smart Quiz Question Creator")
st.markdown("Generate **custom quizzes** from any PDF chapter in seconds.")

# Sidebar settings
with st.sidebar:
    st.header("⚙️ Settings")
    num_qs = st.slider("Number of Questions", 5, 30, 10)
    difficulty = st.selectbox("Difficulty Level", ["Easy", "Medium", "Hard"])
    q_type = st.radio("Question Type", ["MCQs", "True/False", "Mixed"])

    st.markdown("---")
    st.info("👉 Upload a PDF to begin!")

# File uploader
uploaded_file = st.file_uploader("📂 Upload a PDF chapter", type="pdf")

if uploaded_file:
    with st.spinner("📖 Extracting text from PDF..."):
        text = extract_text_from_pdf(uploaded_file)

    if st.button("✨ Generate Questions"):
        with st.spinner("🤖 Generating quiz questions..."):
            questions = generate_questions(text, num_qs, difficulty, q_type)

            st.subheader("📋 Generated Quiz Questions")
            display_questions(questions)

            # Download option
            st.download_button(
                "📥 Download Quiz",
                questions,
                file_name="quiz.txt",
                mime="text/plain"
            )

