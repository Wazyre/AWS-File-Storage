import './App.css';
import AWS, {config} from 'aws-sdk';
import UploadS3Image from './UploadS3Image.js';
import FileHome from './FileHome.js';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

config.update({
  accessKeyId: 'AKIAW2RXDVGG34XBTXHA',
  secretAccessKey: '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',
});

const theBucket = new AWS.S3({
  region: 'us-east-2',
});

function App() {
  return (
    <Container className='contentContainer'>
      <FileHome/>
      <Row/>
      <UploadS3Image />
      <Button href="https://login-file-storage.auth.us-east-2.amazoncognito.com">Click</Button>
    </Container>
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}

export default App;
