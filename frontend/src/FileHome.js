import {useState, useEffect} from 'react';
import AWS, { config } from 'aws-sdk';
import {callLambda} from './Lambda.js';
import { uploadWithContent } from './UploadFile.js'
import ContentEditable from 'react-contenteditable';
import sanitizeHtml from "sanitize-html"
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row'; 
import Table from 'react-bootstrap/Table';
import { BsFillCloudDownloadFill, BsFillEyeFill, BsPencilFill, BsFillTrash3Fill } from 'react-icons/bs';

config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY || '',
});

const theBucket = new AWS.S3({
    params: { Bucket: process.env.REACT_APP_BUCKET },
    region: process.env.REACT_APP_REGION,
});

const socketConn = new WebSocket('wss://qxyg3h2vwh.execute-api.us-east-1.amazonaws.com/production' || '');

let currentVersions = {};

const FileHome = () => {
    const [fileList, setFileList] = useState([]);
    const [viewUrl, setViewUrl] = useState("");
    const [fileType, setFileType] = useState("");
    const [urlChanged, setUrlChanged] = useState(false);
    const [allVersions, setAllVersions] = useState([]);
    const [versionCount, setVersionCount] = useState(5);
    const [editText, setEditText] = useState("");
    const [keyEditing, setKeyEditing] = useState("");
    const [syncPolicy, setSyncPolicy] = useState("closeSync");
    const [syncText, setSyncText] = useState("Close First then Sync");
    const [syncReady, setSyncReady] = useState(false);

    socketConn.addEventListener('open', (e) => {
        console.log('WebSocket is connected');
    });

    socketConn.addEventListener('open', (e) => {
        console.log('WebSocket is connected');
    });

    socketConn.addEventListener('close', (e) => {
        console.log('WebSocket Connection is closed')
    });

    socketConn.addEventListener('error', (e) => {
        console.error('WebSocket Connection is in error', e)
    });

    socketConn.addEventListener('message', (e) => {
        console.log(JSON.parse(e.data).message);
        setSyncReady(true);
    });

    var theParams = {
        Bucket: process.env.REACT_APP_BUCKET,
        Delimiter: '/',
    };

    const listAllFiles = async (data) => {

        const options = {year: 'numeric', month: 'long', day: 'numeric' };
        
        setFileList(
            data.map((obj, idx) => {
                let editable = '';
                if (obj.Key.toLowerCase().includes(".txt")) {
                    editable = <Col><BsPencilFill type='submit' className='view' onClick={function (e) { editDocument(obj.Key) }} /></Col>
                }
                return <>
                <tr key={idx}>
                    <td>{obj.Key}</td>
                    <td>{Math.floor(obj.Size / 1000)} KB</td>
                    <td>{obj.LastModified.toLocaleTimeString('en-US')
                        + ', ' + obj.LastModified.toLocaleDateString('en-US', options)
                        }
                    </td>
                </tr>
                <tr key={"View" + idx}>
                    <Row>
                        <Col>
                            <a href={downloadDocument(obj.Key)} className='view'>
                                <BsFillCloudDownloadFill
                                    
                                />
                            </a>
                        </Col>
                        <Col>
                            <BsFillEyeFill
                                type='submit'
                                className='view'
                                onClick={function(e) {viewDocument(obj.Key)}}
                            />
                        </Col>
                        {editable}
                        <Col>
                            <BsFillTrash3Fill
                                type='submit'
                                className='view'
                                onClick={function (e) { deleteDocument(obj.Key) }}
                            />
                        </Col>
                    </Row>
                </tr>
                <tr> 
                    <td>
                        Versions: 
                        <Form.Select onChange={changeVersion}>
                            {allVersions[idx].OtherVersions.map((item, idx2) => {
                                if (versionCount <= idx2) 
                                return;
                                return <option key={item.Key + idx2} id={item.Key} value={item.VersionId}>
                                    {item.LastModified.toLocaleTimeString('en-US')
                                        + ', ' + item.LastModified.toLocaleDateString('en-US', options)}
                                </option>
                            })}
                        </Form.Select>
                    </td>
                </tr>
                </>
            })
        );
    };

    const changeVersion = (e) => {
        if (syncReady) {
            getVersions();
            setSyncReady(false);
        }

        let idx = e.target.selectedIndex;
        currentVersions = { ...currentVersions, [e.target[idx].id]: e.target.value }
    };

    const downloadDocument = (key) => {
        if (syncReady) {
            getVersions();
            setSyncReady(false);
        }

        if (key in currentVersions) {
            return 'https://' + process.env.REACT_APP_BUCKET + '.s3.us-east-2.amazonaws.com/' + key + '?versionId=' + currentVersions[key];
        }
        else {
            return 'https://' + process.env.REACT_APP_BUCKET + '.s3.us-east-2.amazonaws.com/' + key;
        }
    };

    const viewDocument = (key) => {
        if (syncReady) {
            getVersions();
            setSyncReady(false);
        }
        
        console.log(key);
        console.log(currentVersions[key]);
        console.log(Object.keys(currentVersions));
        console.log(currentVersions);

        let url = '';
        if (key in currentVersions) {
            url = 'https://' + process.env.REACT_APP_BUCKET + '.s3.us-east-2.amazonaws.com/' + key + '?versionId=' + currentVersions[key];
        }
        else {
            url = 'https://' + process.env.REACT_APP_BUCKET + '.s3.us-east-2.amazonaws.com/' + key;
        }

        if (url.toLowerCase().includes(".pdf")) {
            setFileType("PDF");
        }
        else {
            setFileType("DOC");
        }
        
        setViewUrl(url);
        setUrlChanged(!urlChanged);
    };

    const editDocument = (key) => {
        const params = {
            Bucket: process.env.REACT_APP_BUCKET,
            Key: key
        };

        theBucket.getObject(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } 
            else {
                let text = data.Body.toString('utf-8');
                setEditText(text);
                setKeyEditing(key);
            }
        })
    }

    const deleteDocument = (key) => {
        if (syncReady) {
            getVersions();
            setSyncReady(false);
        }

        const params = {
            Bucket: process.env.REACT_APP_BUCKET,
            Key: key
        };

        theBucket.deleteObject(params, function(err, data) {
            if (err) console.log(err, err.stack);
        });
    };

    const getDocuments = async() => {
        theBucket.listObjectsV2(theParams, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            getVersions(data.Contents);
        });
    };

    const getVersions = async() => {

        const params = {
            Bucket: process.env.REACT_APP_BUCKET,
            // Prefix: obj.Key
        };

        theBucket.listObjectVersions(params, function(err, data) {
            if (err) console.log(err, err.stack);
            else {
                return consolidateData(data.Versions);
            }
        })
    };

    const consolidateData = (data) => {
        let versions = [];

        data.forEach(obj => {
            if (obj.IsLatest) {
                obj = {...obj, OtherVersions: [obj]};
                versions = [
                    ...versions,
                    obj
                ];
            }
            else {
                let idx = versions.findIndex(item => item.Key === obj.Key)
                versions[idx].OtherVersions = [...versions[idx].OtherVersions, obj];
            }
        })
        setAllVersions(versions);
    };

    const handleVersionCount = (e) => {
        setVersionCount(e.target.value);
    };

    const handleEditChange = (e) => {
        setEditText(e.target.value);
    };

    const handleEditSubmit = () => {
        const sanitizeConf = {
            allowedTags: ['i', 'em', 'strong', 'a'],
            allowedAttributes: { a: ["href"] }
        };

        uploadWithContent(keyEditing, sanitizeHtml(editText, sanitizeConf));
        setKeyEditing("");
        setEditText("");
    };

    const handleSyncToggle = (e) => {
        if (e.target.checked) {
            setSyncPolicy("forceSync");
            setSyncText("Force Sync");
        }
        else {
            setSyncPolicy("closeSync");
            setSyncText("Close First then Sync");
        }
    };

    useEffect(() => {
        (async() => {
           await getVersions();
        })();
    }, []); 

    useEffect(() => {
        console.log(viewUrl);
        console.log(currentVersions);
    }, [viewUrl, keyEditing]); // Reload app to render viewer/editor

    useEffect(() => {
        console.log(allVersions);
        listAllFiles(allVersions);
    }, [allVersions, versionCount]);


    if (viewUrl === "") {
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
                            <Form.Group controlId="versionControlId">
                                <Form.Label>Version Count</Form.Label>
                                <Form.Control value={versionCount} type="number" placeholder={5} onChange={handleVersionCount} />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Label> Sync Policy </Form.Label>
                            <Form.Switch
                                id="syncSwitch"
                                label={syncText}
                                onChange={handleSyncToggle}
                            />
                        </Col>
                    </Row>
                </Card>
                <Row>
                    <Col>
                        <ContentEditable className="editable" onChange={handleEditChange} html={editText}/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button disabled={editText === ""} onClick={handleEditSubmit}>Upload Edit</Button>
                    </Col>
                </Row>
            </div>
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
                        <Form.Group controlId="versionControlId">
                            <Form.Label>Version Count</Form.Label>
                            <Form.Control value={versionCount} type="number" placeholder={5} onChange={handleVersionCount} />
                        </Form.Group>
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
                        <Form.Group controlId="versionControlId">
                            <Form.Label>Version Count</Form.Label>
                            <Form.Control value={versionCount} type="number" placeholder={5} onChange={handleVersionCount}/>
                        </Form.Group>
                    </Col>
                </Row>
            </Card>
            <Row/>
            {/* <iframe src={'https://view.officeapps.live.com/op/embed.aspx?src=' + viewUrl} title='DocViewer' width='700px' height='600px'/> */}
                <iframe src={'https://docs.google.com/viewer?url=' + viewUrl + '&embedded=true'} title='DocViewer' width='700px' height='600px' />
            </div>
        );
    }
    
};

export default FileHome;