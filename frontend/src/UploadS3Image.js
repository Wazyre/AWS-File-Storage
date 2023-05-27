import React, {useState, useEffect} from 'react';
import AWS, {config} from 'aws-sdk';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const theBucket = new AWS.S3({
    params: {Bucket: process.env.S3_BUCKET},
    region: process.env.REGION,
});

const UploadS3Image = () => {
    const [fileChosen, setFileChosen] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileInput = (e) => {
        setFileChosen(e.target.files[0]);
    }

    const handleFileUpload = (file) => {
        const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: process.env.S3_BUCKET,
            Key: file.name
        };

        theBucket.putObject(params)
        .on('httpdUploadProgress', (evt) => {
            setProgress(Math.round((evt.loaded / evt.total) * 100))
        })
        .send((err) => {
            if (err) console.log(err)
        })
    }


    return (
        <Container>
            <Card>
                <h4>File Upload Progress {progress}%</h4>
                <input type="file" onChange={handleFileInput} />
                <Button onClick={() => handleFileUpload(fileChosen)}>Upload File</Button>
            </Card>
        </Container>
    );
}

export default UploadS3Image;