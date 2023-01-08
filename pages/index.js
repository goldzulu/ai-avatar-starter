// Add useState import to top of file
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  // Don't retry more than 20 times
  const maxRetries = 20;

  // Add input state property
  const [input, setInput] = useState('');
  // create a img state property
  const [img, setImg] = useState('');

  // number of retries
  const [retry, setRetry] = useState(0);
  // number of retries left
  const [retryCount, setRetryCount] = useState(maxRetries);

  const [isGenerating, setIsGenerating] = useState(false);

  const [finalPrompt, setFinalPrompt] = useState('');

  // Add this function
  const onChange = (event) => {
    setInput(event.target.value);
  };
  const generateAction = async () => {
    console.log('Generating...');

    // Add this check to make sure there is no double click
    if (isGenerating && retry === 0) return;

    console.log('Generating... further');
    // Set loading has started
    setIsGenerating(true);

     // If this is a retry request, take away retry count
     if (retry > 0) {
      setRetryCount((prevState) => {
          if (prevState === 0) {
              return 0;
          } else {
              return prevState - 1;
          }
      });

      setRetry(0);
    }

    // Add the fetch request
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg'
      },
      body: JSON.stringify({ input })
    });
    const data = await response.json();

    // If model still loading, drop that retry time
    if (response.status === 503) {
      console.log('Model still loading, try again in a '+ data.estimated_time + ' seconds');
      // Set the estimated time property in state
      setRetry(data.estimated_time);
      return;
    }

    // if another error, drop error
    if (!response.ok ) {
      console.log('Error: ${data.error}');
      setIsGenerating(false);
      return;
    }

    // Set final prompt here
    setFinalPrompt(input);
    // Remove content from input box
    setInput('');
    setImg(data.image);
    setIsGenerating(false);
  };

  // sleep function
  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Add this useEffect
  useEffect(() => {
    const runRetry = async () => {
      // If there are no retries left, stop
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutese`);
        setRetryCount(maxRetries);
        return;
      }
      console.log(`Retrying in ${retry} seconds...`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>AI Publicity Photo Poser | the fleeflees</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Publicity Photo Poser</h1>
          </div>
          <div className="header-subtitle">
            <h2>Writing about me and want to have a photo of me for your articles, blurb or speaker synopsis?</h2>
            <p>Write down the kind of photo you want me to pose and my AI Personal assistant will generate one for you!</p>
            <p>The AI Assistant might be cheeky and send you some funny silly photos. If that happens just rewrite you request and try again :)</p>
            <p>Sometimes my assistant will take short naps and might take a bit longer initially</p>
          </div>
          {/* Add prompt container here */}
          <div className="prompt-container">
            <input className="prompt-box" value={input} onChange={onChange} placeholder='e.g. smiling wearing sunglasses' />
            <div className="prompt-buttons">
              {/* Tweak classNames to change classes */}
              <a 
                className={ 
                  isGenerating ? 'generate-button loading' : 'generate-button'
                } 
                onClick={generateAction}
              > 
                {/* Tweak to show a loading indicator */}
                <div className="generate">
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
         {/* Add output container */}
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={input} />
            {/* Add prompt here */}
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            {/* <Image src={fleefleesLogo} alt="fleeflees logo" /> */}
            <p>build by the head of the fleeflees</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
