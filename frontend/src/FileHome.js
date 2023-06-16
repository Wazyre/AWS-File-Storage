import {useState, useEffect} from 'react';
import AWS, { config } from 'aws-sdk';
import {callLambda} from './Lambda.js';
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
    accessKeyId: '',
    secretAccessKey: '',
});

const theBucket = new AWS.S3({
    params: { Bucket: 'projfilestoragebucket' },
    region: 'us-east-2',
});

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

    var theParams = {
        Bucket: 'projfilestoragebucket',
        Delimiter: '/',
    };

    const listAllFiles = async (data) => {
        //const allData = await getDocuments();
        

        // for (const obj of allData) {
        //     setAllVersions(allVersions => [
        //         ...allVersions,
        //         getVersions(obj.Key)
        //     ])
        //     console.log(obj);
        // }
        // console.log(allVersions);

        // data.Contents.forEach(obj => {
        //     let tempArr = getVersions(obj.Key);
        //     setAllVersions(allVersions => [
        //         ...allVersions,
        //         tempArr
        //     ]);
        //     console.log(obj);
        // })
        // console.log(allVersions);

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
        // let key = e.target.name;
        // let updatedValue = {key: e.target.value};
        // setVersions(versions => ({
        //     ...versions,
        //     ...updatedValue,
        // }));
        let idx = e.target.selectedIndex;
        currentVersions = { ...currentVersions, [e.target[idx].id]: e.target.value }
    };

    const downloadDocument = (key) => {

        if (key in currentVersions) {
            return 'https://projfilestoragebucket.s3.us-east-2.amazonaws.com/' + key + '?versionId=' + currentVersions[key];
        }
        else {
            return 'https://projfilestoragebucket.s3.us-east-2.amazonaws.com/' + key;
        }
    };

    const viewDocument = (key) => {

        console.log(key);
        console.log(currentVersions[key]);
        console.log(Object.keys(currentVersions));
        console.log(currentVersions);

        let url = '';
        if (key in currentVersions) {
            url = 'https://projfilestoragebucket.s3.us-east-2.amazonaws.com/' + key + '?versionId=' + currentVersions[key];
        }
        else {
            url = 'https://projfilestoragebucket.s3.us-east-2.amazonaws.com/' + key;
        }

        if (url.toLowerCase().includes(".pdf")) {
            setFileType("PDF");
        }
        else {
            setFileType("DOC");
        }
        
        setViewUrl(url);
        setUrlChanged(!urlChanged);

        // const urlExpire = 120;
        // let signedUrl = '';

        
        // if (key in currentVersions) {
        //     signedUrl = theBucket.getSignedUrl('getObject', {
        //         Bucket: 'projfilestoragebucket',
        //         Key: key,
        //         ResponseContentEncoding: 'base64',
        //         // ResponseContentType: 'application/pdf',
        //         ResponseContentDisposition: 'inline',
        //         VersionId: currentVersions[key],
        //         Expires: urlExpire
        //     });
        //     console.log('here');
        // }
        // else {
        //     theBucket.getObject({
        //         Bucket: 'projfilestoragebucket',
        //         Key: key,
        //         // ResponseContentEncoding: 'base64',
        //         // ResponseContentType: 'application/pdf',
        //         // ResponseContentDisposition: 'inline',
        //         // Expires: urlExpire
        //     }, function(err, data) {
        //         console.log(data);
        //     });
            
        // }

        // const url = signedUrl.split('?')[0];
        // if (url.toLowerCase().includes(".pdf")) {
        //     setFileType("PDF");
        // }
        // else {
        //     setFileType("DOC");
        // }
        
        // setViewUrl(url);
        // setUrlChanged(!urlChanged);
    };

    const editDocument = (key) => {
        const params = {
            Bucket: 'projfilestoragebucket',
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
        const params = {
            Bucket: 'projfilestoragebucket',
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
        // theBucket.getObject({
        //     Bucket: 'projfilestoragebucket',
        //     Key: 'test.docx'}, function (err, data) {
        //     if (err) console.log(err, err.stack);
        //     else {
        //         let temp = data.Body.toString('utf-8');
        //         console.log(temp);
        //     }
        // })

        const params = {
            Bucket: 'projfilestoragebucket',
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
        // setAllData(data);

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
                //let copy = [...allVersions];
                let idx = versions.findIndex(item => item.Key === obj.Key)
                versions[idx].OtherVersions = [...versions[idx].OtherVersions, obj];
                //setAllVersions(copy);
                
                // setAllVersions(allVersions => [
                //     ...allVersions,
                //     {
                //         [obj.Key]: (allObjs => [
                //             ...allObjs,
                //             obj
                //         ])
                //     }
                // ]);
            }
        })
        setAllVersions(versions);
    };

    const handleVersionCount = (e) => {
        setVersionCount(e.target.value);
    };

    const handleEditChange = (e) => {
        // const sanitizeConf = {
        //     allowedTags: ['i', 'em', 'strong', 'a'],
        //     allowedAttributes: { a: ["href"] }
        // };

        setEditText(sanitizeHtml(e.target.innerHTML));
    };

    const handleEditSubmit = (e) => {
        const params = {
            Bucket: 'projfilestoragebucket',
            Key: keyEditing
        };
    };

    useEffect(() => {
        (async() => {
           await getVersions();
        })();
    }, []); // Reload app to render viewer

    useEffect(() => {
        console.log(viewUrl);
        console.log(currentVersions);
    }, [viewUrl, keyEditing]);

    useEffect(() => {
        console.log(allVersions);
        listAllFiles(allVersions);
        //console.log(allVersions[10])
    }, [allVersions, versionCount]);

    // if (number < fileList.length) {
    //     return <div></div>
    // }

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
                    </Row>
                </Card>
                <Row>
                    <Col>
                        <ContentEditable onChange={handleEditChange} html={editText}/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button onClick={handleEditSubmit}>Upload Edit</Button>
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