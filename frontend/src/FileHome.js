import {useState, useEffect} from 'react';
import AWS, { config } from 'aws-sdk';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row'; 
import Table from 'react-bootstrap/Table';
import { BsFillCloudDownloadFill, BsFillEyeFill, BsFillTrash3Fill } from 'react-icons/bs';

config.update({
    accessKeyId: '',
    secretAccessKey: '',
});

const theBucket = new AWS.S3({
    params: { Bucket: 'projfilestoragebucket' },
    region: 'us-east-2',
});

const FileHome = () => {
    const [fileList, setFileList] = useState([]);
    const [viewUrl, setViewUrl] = useState("");
    const [fileType, setFileType] = useState("");

    var theParams = {
        Bucket: 'projfilestoragebucket',
        Delimiter: '/',
    };

    const listAllFiles = () => {
        theBucket.listObjectsV2(theParams, function(err, data) {
            if (err) {
                console.log(err);
                return;
            }
            const options = {year: 'numeric', month: 'long', day: 'numeric' };
            setFileList(
                data.Contents.map(obj =>
                    <>
                    <tr>
                        <td>{obj.Key}</td>
                        <td>{Math.floor(obj.Size / 1000)} KB</td>
                        <td>{obj.LastModified.toLocaleTimeString('en-US')
                            + ', ' + obj.LastModified.toLocaleDateString('en-US', options)
                            }
                        </td>
                        <td>
                            <a href={downloadDocument(obj.Key)}>
                                <BsFillCloudDownloadFill
                                    className='view'
                                />
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <BsFillEyeFill
                                className='view'
                                onClick={function(e) {viewDocument(obj.Key)}}
                            />
                        </td>
                        <td>
                            <BsFillTrash3Fill
                                type='submit'
                                className='view'
                                onClick={function (e) { deleteDocument(obj.Key) }}
                            />
                        </td>
                    </tr>
                    </>
                )
            );
        });
    };

    const downloadDocument = (key) => {
        const urlExpire = 120;

        return theBucket.getSignedUrl('getObject', {
            Bucket: 'projfilestoragebucket',
            Key: key,
            Expires: urlExpire
        })
    }

    const viewDocument = (key) => {
        const urlExpire = 120;
    
        const signedUrl = theBucket.getSignedUrl('getObject', {
            Bucket: 'projfilestoragebucket',
            Key: key,
            ResponseContentEncoding: 'base64',
            // ResponseContentType: 'application/pdf',
            ResponseContentDisposition: 'inline',
            Expires: urlExpire
        });

        const url = signedUrl.split('?')[0];
        if (url.toLowerCase().includes(".pdf")) {
            setFileType("PDF");
        }
        else {
            setFileType("DOC");
        }

        setViewUrl(url);
    };

    const deleteDocument = (key) => {
        const params = {
            Bucket: 'projfilestoragebucket',
            Key: key
        };

        theBucket.deleteObject(params, function(err, data) {
            if (err) console.log(err, err.stack);
        });
    };

    useEffect(() => {
        listAllFiles();
        console.log(viewUrl);
    }, [viewUrl]);

    if (viewUrl === "") {
        return (
            <Card>
                <Row>
                    <Col>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Last Modified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fileList}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Card>
        );
    }
    else if (fileType === "PDF"){
        return (
           <div>
            <Card>
                <Row>
                    <Col>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Last Modified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fileList}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        
                    </Col>
                </Row>
            </Card>
            <Row/>
            <iframe src={viewUrl} title='PdfViewer' width="700px" height="600px">
                <p>Alternative text - include a link <a href={viewUrl}>to the PDF!</a></p>
            </iframe>
            </div> 
        );
    }
    else if (fileType === "DOC") {
        return (
            <div>
            <Card>
                <Row>
                    <Col>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Last Modified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fileList}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        
                    </Col>
                </Row>
            </Card>
            <Row/>
            <iframe src={'https://view.officeapps.live.com/op/embed.aspx?src=' + viewUrl} title='DocViewer' width='700px' height='600px'>This is an embedded <a target='_blank' rel="noreferrer" href='http://office.com'>Microsoft Office</a> document, powered by <a target='_blank' rel="noreferrer" href='http://office.com/webapps'>Office Online</a>.</iframe>

            </div>
        );
    }
    
};

export default FileHome;