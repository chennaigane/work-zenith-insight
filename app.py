import gradio as gr

def greet(name):
    return f"Hello, {name}! Your Gradio app is now working."

iface = gr.Interface(fn=greet, inputs="text", outputs="text", title="Work Zenith Insight", description="Gradio-powered app")
iface.launch()
