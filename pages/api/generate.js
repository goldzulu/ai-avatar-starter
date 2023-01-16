const generateAction = async (req, res) => {
    console.log('Request Received...');

    const bufferToBase64 = (buffer) => {
        const base64 = buffer.toString('base64');
        return `data:image/png;base64,${base64}`;
    };

    // Get input from the body of the request
    // Append the model name and some initial prompt
    const input = JSON.parse(req.body).input;

    // multiple models
    
    // const model = 'uyasophia';
    const model = 'uyasophiadl2';

    // Add fetch request to Hugging Face
    const response = await fetch(`https://api-inference.huggingface.co/models/goldzulu/${model}`, 
    {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
        },
        method: 'POST',
        body: JSON.stringify({
            inputs: input,
        }),
    });

    if (response.ok) {
        const buffer = await response.buffer();
        // convert to base64
        const base64 = bufferToBase64(buffer);
        res.status(200).json({ image: base64 });
    } else if (response.status === 503) {
        const json = await response.json();
        res.status(503).json(json);
    } else {
        const json = await response.json();
        res.status(response.status).json({ error: response.statusText });
    }
}

export default generateAction;