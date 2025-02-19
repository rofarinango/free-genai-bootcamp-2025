## Running Ollama Third-Party Service Container


### Choosing a Model
Choose the mode_id that ollama will launch from the [Ollama Library](https://ollama.com/library).

### Getting the Host IP

#### Linux
Get your IP address
```sh
sudo api install net-tools
ifconfig

```

Or you can try this way `hostname -I | awk '{print $1}'`

#### Mac
```ipconfig getifaddr en0```


HOST_IP=$(ipconfig getifaddr en0) NO_PROXY=localhost 
LLM_ENDPOINT_PORT=8008 LLM_MODEL_ID="llama3.2:1b" docker compose up

### Ollama API

Once the Ollama server is running we can make API calls to the ollama API

https://github.com/ollama/ollama/blob/main/docs/api.md

## Download (Pull) a mode

curl http://localhost:8008/api/pull -d '{
    "model": "llama3.2:1b"
}'

## Generate a Request

curl http://localhost:8008/api/generate -d '{
    "model": "llama3.2:1b",
    "prompt": "Why is the sky BLUE?"
}'


### Technical Uncertainty
Q: Does bridge mode mean we can only access Ollama API with another model in the docker compose?

A: No, the host machine will be able to access it

Q: Which port is being mapped 8008->14143
A: In this case 8008 is the port that the host machine will acess. The other in the guest port (the port of the service inside container)

Q: If we pass the LLM_MODEL_ID to the ollama server will it download the model when on start?
A: It does not appear so. The ollama CLI might be running multiple APIs so you need to call the pull api before trying to generate text

Q: Will the model be downloaded in the container?
Does that mean the ml model will be deleted when the container stops running?
A: THe model will download into the container, and vanish when the container stop running. You need to mount a local drive and there is probably more work to be done.