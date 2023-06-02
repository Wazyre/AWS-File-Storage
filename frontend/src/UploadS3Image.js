import React, {useState, useEffect} from 'react';
import AWS, {config} from 'aws-sdk';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

config.update({
    accessKeyId: 'AKIAW2RXDVGG34XBTXHA',
    secretAccessKey: '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',
});

const theBucket = new AWS.S3({
    params: { Bucket: 'projfilestoragebucket' },
    region: 'us-east-2',
});

const UploadS3Image = () => {
    const [fileChosen, setFileChosen] = useState(null);
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
            Bucket: 'projfilestoragebucket',
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
                    <Button type="submit" onClick={() => handleFileUpload(fileChosen)}>Upload File</Button>
                </Col>
            </Row>   
        </Card>
    );
}

export default UploadS3Image;