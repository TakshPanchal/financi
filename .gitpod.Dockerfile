FROM gitpod/workspace-full:latest
RUN sudo apt-get install ffmpeg libsm6 libxext6  -y
RUN sudo apt install ghostscript python3-tk -y
