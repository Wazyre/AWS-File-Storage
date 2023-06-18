import React, {useState} from 'react';
import AWS, {config} from 'aws-sdk';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY || '',
});

const theBucket = new AWS.S3({
    params: { Bucket: process.env.REACT_APP_BUCKET },
    region: process.env.REACT_APP_REGION,
});

export const uploadWithContent = (key, content) => {

    const params = {
        ACL: 'public-read',
        Body: content,
        Bucket: process.env.REACT_APP_BUCKET,
        ContentType: 'application',
        ContentDisposition: 'inline',
        Key: key
    };

    theBucket.putObject(params)
        .on('httpdUploadProgress', (evt) => {
            
        })
        .send((err) => {
            if (err) console.log(err)
            window.location.reload(false);
        })
};


const UploadFile = () => {
    const [fileChosen, setFileChosen] = useState("");
    const [progress, setProgress] = useState(0);

    

    const handleFileInput = (e) => {
        setFileChosen(e.target.files[0]);
    }

    const handleFileUpload = (file) => {
        var fileType = "";

        if (file.name.toLowerCase().includes('.pdf')) {
            fileType = 'application/pdf';
        }
        else {
            fileType = 'application';
        }

        const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: process.env.REACT_APP_BUCKET,
            ContentType: fileType,
            ContentDisposition: 'inline',
            Key: file.name
        };

        theBucket.putObject(params)
        .on('httpdUploadProgress', (evt) => {
            setProgress(Math.round((evt.loaded / evt.total) * 100))
        })
        .send((err) => {
            if (err) console.log(err)
            window.location.reload(false);
        })
        
    };


    return (
        <Card>
            <Row>
                <Col>
                    <h4>File Upload Progress {progress}%</h4>
                </Col>
            </Row>
            <Row>
                <Col>
                    <input type="file" onChange={handleFileInput} />
                    <Button disabled={fileChosen === ""} type="submit" onClick={() => handleFileUpload(fileChosen)}>Upload File</Button>
                </Col>
            </Row>   
        </Card>
    );
}

export default UploadFile;