import React, { useState, useEffect } from 'react';
import AWS, { config } from 'aws-sdk';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const theBucket = new AWS.S3({
    params: { Bucket: process.env.S3_BUCKET },
    region: process.env.REGION,
});

const DownloadS3 = () => {
    const [fileChosen, setFileChosen] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileInput = (e) => {
        setFileChosen(e.target.files[0]);
    }

    const handleListFiles = (s3Folder) => {
        const params = {
            Bucket: process.env.S3_BUCKET,
            Delimiter: '/',
            Prefix: s3Folder + '/'
        };

        const data = theBucket.listObjects(params);

        for (let index = 1; index < data['Contents'].length; index++) {
            console.log(data['Contents'][index]['Key'])
        }
    }


    return (
        // <Container>
        //     <Card>
        //         <h4>File Upload Progress {progress}%</h4>
        //         <input type="file" onChange={handleFileInput} />
        //         <Button onClick={() => handleListFiles(fileChosen)}>Upload File</Button>
        //     </Card>
        // </Container>
    );
}

export default DownloadS3;