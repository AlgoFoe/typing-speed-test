import './App.css';
import { useState,useEffect ,useRef} from 'react';
import { generateSlug } from "random-word-slugs";
const NUM_WORDS = 50;
const SECONDS = 60;

function App() {
  const [words,setWords] = useState([]);
  const [countDown,setCountDown] = useState(SECONDS);
  const [currInput,setCurrInput] = useState('');
  const [currIndex,setCurrIndex] = useState(0);
  const [currChar,setCurrChar] = useState('');
  const [currCharIndex,setCurrCharIndex] = useState(-1);
  const [correct,setCorrect] = useState(0);
  const [incorrect,setIncorrect] = useState(0);
  const [status,setStatus] = useState("wait");
  const focusInput = useRef(null);

  const [wordsCorrectness, setWordsCorrectness] = useState([]);

  useEffect(()=>{
    document.addEventListener('keydown',e=>{
        if(e.key==='Tab'){
          e.preventDefault()
          focusInput.current.focus()
          console.log('tab')
        }
      })
    // when the component mounts
    setWords(generateWords()) 
  },[])

  useEffect(()=>{
    if(status==="started"){
      focusInput.current.focus()
    }
  },[status])

  const generateWords=()=>{   
    return generateSlug(NUM_WORDS, { format: 'lower' }).split(' ');;
  }  
  const start=()=>{
    if(status==="completed"){
      setWords(generateWords())
      setCurrIndex(0)
      setCorrect(0)
      setIncorrect(0)
      setCurrChar('')
      setCurrCharIndex(-1)
    }

    if(status!=="started"){
      setStatus("started")
      // let id = setInterval(()=>{
      //   setCountDown((prevCount)=>{
      //     if(prevCount===0){
      //       clearInterval(id)
      //       setStatus("completed")
      //       setCurrInput("")
      //       return SECONDS
      //     }else{
      //       return prevCount-1 
      //     }
      //     })
      // },1000)
    }
  }
  const handleKeyPress = ({ keyCode, key }) => {
    // key code = 32 for space bar
    if (keyCode === 32) {
      if (currCharIndex >= 0 || currInput.trim() !== '') {
        matchWord();
        setCurrInput('');
        setCurrCharIndex(-1);
      }
      
      setCurrIndex(currIndex + 1);
  
      // Check if the last word of the line is typed
      const isLastWordOfLine = currIndex % 10 === 8;
      if (isLastWordOfLine) {
        const lineIndex = Math.floor(currIndex / 10) + 1;
        const lastLineElement = document.querySelector(`.line-${lineIndex}`);
        lastLineElement && lastLineElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
      }
    } else if (keyCode === 8) {
      setCurrCharIndex(currCharIndex - 1);
      setCurrChar('');
    } else {
      setCurrCharIndex(currCharIndex + 1);
      setCurrChar(key);
    }
  };
   
  const matchWord = () => {
    const wordToCompare = words[currIndex];
    const isMatching = wordToCompare === currInput.trim();
    const currentWordCorrectness = currInput.trim().split('').map((char, index) => char === wordToCompare[index]);
    
    // Update wordsCorrectness state with the correctness of the current word
    setWordsCorrectness((prev) => [...prev, currentWordCorrectness]);
  
    if (isMatching) {
      setCorrect(correct + 1);
    } else {
      setIncorrect(incorrect + 1);
    }
    console.log(isMatching)
  };
  

  const getClass = (wordIndex, charIndex, char) => {
    if (wordIndex < currIndex) {
      // For words that have already been typed, using wordsCorrectness to determine color
      const correctness = wordsCorrectness[wordIndex];
      return correctness[charIndex] ? "color-green" : "color-red";
    } else if (wordIndex === currIndex) {
      // Prevent coloring the first character of the new word incorrectly
      if (currInput.length === 0) {
        return ""; // No coloring for the first character if no input yet
      }
      if (charIndex < currInput.length) {
        // For the current word being typed, apply coloring based on current input
        return char === currInput[charIndex] ? "color-green" : "has-background-danger-dark";
      }
    }
    // Default case, no specific coloring
    return "";
  };
  
  const getLines = () => {
    return words.reduce((acc, word, index) => {
      const lineIndex = Math.floor(index / 10); // Assuming 10 words per line
      if (!acc[lineIndex]) {
        acc[lineIndex] = [];
      }
      acc[lineIndex].push(
        <span
          key={index}
          id={`word-${index}`}
          className={`line-${lineIndex}`}
        >
          {word.split("").map((char, i) => (
            <span className={`is-size-4 ${getClass(index, i, char)}`} key={i}>
              {char}
            </span>
          ))}
          <span> </span>
        </span>
      );
      return acc;
    }, []);
  };
  
  return (
    <div className="App">
      <div className="section pb-0">
        <div className="is-size-1 has-text-centered has-text-primary">
          <h2>{countDown}</h2>
        </div>
      </div>
      
      <div className="section py-6">
        <button onClick={start} className='button is-info is-fullwidth'>Start</button>
      </div>
      {status === "started" && (
        <div className="section pt-1">
          <div className="card">
            <div className="card-content">
              <div className="content">
                {getLines().map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="control is-expanded section pt-0">
        <input
          ref={focusInput}
          style={{boxShadow:'none',backgroundColor:'white',border:'none',outline:'none'}}
          disabled={status !== "started"}
          type="text"
          className="input"
          onKeyDown={handleKeyPress}
          value={currInput}
          onChange={(e) => setCurrInput(e.target.value)}
        />
        </div>
      {status==="completed" && (
      <div className="section">
        <div className="columns">
          <div className="column has-text-centered">
            <p className='is-size-5'>Words per minute:</p>
            <p className='is-size-1 has-text-primary'>
              {(correct)}
            </p>
          </div>
          <div className="column has-text-centered">
            <p className='is-size-5'>Accuracy:</p>
            <p className='is-size-1 has-text-info'>
              {(correct/(correct+incorrect))*100}%</p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default App;
