import './App.css';
import React, {Suspense} from 'react';
import UploadFile from './UploadFile.js';
import FileHome from './FileHome.js';
import Loader from './Loader'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

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
					<UploadFile />
				</Container>
			</Suspense>
		);
	}
}

export default App;
