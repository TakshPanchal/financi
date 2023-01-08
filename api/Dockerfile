FROM python:3.9
WORKDIR /src
COPY ./requirements.txt
RUN sudo apt-get install ffmpeg libsm6 libxext6  -y
RUN sudo apt install ghostscript python3-tk -y
RUN pip install --no-cache-dir --upgrade -r /requirements.txt
COPY ./app /code/app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]


