# ML

To run the ML side of these project you'll need to have a container with all the needed libraries and configurations ready.

So the first step is to create a container. For that we'll use Docker. We need to be in a linux machine with Docker installed or install the linux subsystem for windows. Using Docker Desktop on windows is not recommended because of the usage of the GPU.

We just need to execute the command "docker-compose up" in the terminal inside the ML folder.
```bash
    cd some_path/ML

    docker-compose up
```

Then to access the container we just need to execute the command:

    docker exec -it ml_cot_ml_1 /bin/bash

Next we need to prepare some configurations manually inside the container:

### Huggingface:
These library allows you to interact with datasets and models stored in Huggingface. First we need to create an account in Huggingface. Then we need to install huggingface-cli:

    pip install huggingface_hub

To login in huggingface you need to execute the command:

    huggingface-cli login

After that you'll be asked to enter your user token.
    

### git lfs:
Git LFS is an open source Git extension used to manage large files and binary files in a separate ”LFS store”.
These library allows you to interact with dataset repository stored in Huggingface.
To install git lfs you need to execute the command:

```bash
    curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash

    sudo apt-get install git-lfs
```


inside the Dataset_creation folder you'll run the following:
```bash
    git lfs install
    git clone https://huggingface.co/datasets/nelson2424/Chess_openings_dataset 
```
    
more info in https://huggingface.co/docs/datasets/share#clone-the-repository.

### W&B:
These library allows you to track your ML training experiments and visualize them.
To use the weights and biases logging you need to create an account on https://wandb.ai/site and have the token of your account ready.
Then you need to execute the command:   

    wandb login

And put the token of your account.
More info in https://docs.wandb.ai/quickstart

