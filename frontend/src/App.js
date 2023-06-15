import './App.css';
import React, {Suspense} from 'react';
import AWS, {config} from 'aws-sdk';
import UploadS3Image from './UploadS3Image.js';
import FileHome from './FileHome.js';
import Loader from './Loader'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

// config.update({
//   accessKeyId: '',
//   secretAccessKey: '',
// });

// const theBucket = new AWS.S3({
//   region: 'us-east-2',
// });

class App extends React.Component {
  componentDidMount() {
    this.props.hideLoader();
  }

  render () {
    return (
      <Suspense fallback={<Loader size="big" />}>
        <Container className='contentContainer'>
          <FileHome />
          <Row />
          <UploadS3Image />
          <Button href="https://login-file-storage.auth.us-east-2.amazoncognito.com">Click</Button>
        </Container>
      </Suspense>
    );
  }
  
}

export default App;
