import streamlit as st

st.set_page_config(page_title="Work Zenith Insight", layout="centered")

st.title("Welcome to Work Zenith Insight 👋")
st.write("This is a sample Streamlit app deployed from GitHub to Hugging Face Spaces.")

name = st.text_input("Enter your name:")
if name:
    st.success(f"Hello, {name}! Your app is now working.")
