FROM nvidia/cuda:11.2.2-cudnn8-devel-ubuntu20.04


RUN apt-get update && apt-get install -y \
    wget\
    curl \
    git \
    python3.8 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# RUN curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o ~/miniconda.sh \
#     && sh ~/miniconda.sh -b -p /opt/conda \
#     && rm ~/miniconda.sh

# ENV PATH /opt/conda/bin:$PATH
# RUN conda update -n base -c defaults conda
# RUN conda install cudatoolkit

RUN nvcc --version

# RUN conda activate pytorch
RUN pip3 install torch torchvision torchaudio -f https://download.pytorch.org/whl/cu113/torch_stable.html

WORKDIR /app
COPY . .
RUN pip3 install -r requirements.txt    