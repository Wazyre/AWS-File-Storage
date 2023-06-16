import {useState, useEffect} from 'react';
import AWS, { config } from 'aws-sdk';
import {callLambda} from './Lambda.js';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
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

let currentVersions = {};

const FileHome = () => {
    const [fileList, setFileList] = useState([]);
    const [viewUrl, setViewUrl] = useState("");
    const [fileType, setFileType] = useState("");
    const [allData, setAllData] = useState([]);
    const [number, setNumber] = useState(0);
    const [urlChanged, setUrlChanged] = useState(false);
    const [allVersions, setAllVersions] = useState([]);
    //const [currentVersions, setCurrentVersions] = useState({}); // Stores current selected version of each file

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
                //if(obj.IsLatest) 
                return <>
                <tr key={idx}>
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
                    <tr key={"View" + idx}>
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
                    <tr> 
                    <td>
                        Versions: 
                        <Form.Select onChange={changeVersion}>
                            {console.log(idx)}
                            {allVersions[idx].OtherVersions.map((item, idx2) =>
                                <option key={item.Key + idx2} id={item.Key} value={item.VersionId}>
                                    {item.LastModified.toLocaleTimeString('en-US')
                                        + ', ' + item.LastModified.toLocaleDateString('en-US', options)}
                                </option>
                            )}
                        </Form.Select>
                    </td>
                </tr>
                </>
                //return <></>
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

        console.log(e);
        let copyObj = currentVersions;
        currentVersions = { ...currentVersions, [e.target[idx].id]: e.target.value }
        //setCurrentVersions(copyObj);
    };

    const downloadDocument = (key) => {

        if (key in currentVersions) {
            return 'https://projfilestoragebucket.s3.us-east-2.amazonaws.com/' + key + '?versionId=' + currentVersions[key];
        }
        else {
            return 'https://projfilestoragebucket.s3.us-east-2.amazonaws.com/' + key;
        }
    };

    // const downloadVersionedDocument = (key, version) => {
    //     const urlExpire = 120;

    //     return theBucket.getSignedUrl('getObject', {
    //         Bucket: 'projfilestoragebucket',
    //         Key: key,
    //         Version: version,
    //         Expires: urlExpire
    //     })
    // };

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
            console.log(data.Contents)
            // return data.Contents;
            getVersions(data.Contents);
            //listAllFiles(data.Contents);
        });
    };

    const getVersions = async() => {
        theBucket.getObject({
            Bucket: 'projfilestoragebucket',
            Key: 'test.docx'}, function (err, data) {
            if (err) console.log(err, err.stack);
            else {
                let temp = data.Body.toString('utf-8');
                console.log(temp);
            }
        })

        const params = {
            Bucket: 'projfilestoragebucket',
            // Prefix: obj.Key
        };

        theBucket.listObjectVersions(params, function(err, data) {
            if (err) console.log(err, err.stack);
            else {
                console.log(data.Versions);
                // setNumber(number + 1); // Keep track of which files received their versions so far
                return consolidateData(data.Versions);
            }
        })
    };

    const consolidateData = (data) => {
        console.log(data);
        setAllData(data);

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
    }

    useEffect(() => {
        (async() => {
           await getVersions();
        })();
    }, []); // Reload app to render viewer

    useEffect(() => {
        console.log(viewUrl);
        console.log(currentVersions);
    }, [viewUrl]);

    useEffect(() => {
        console.log(allVersions);
        listAllFiles(allVersions);
        //console.log(allVersions[10])
    }, [allVersions]);

    // if (number < fileList.length) {
    //     return <div></div>
    // }

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
            {/* <iframe src={'https://view.officeapps.live.com/op/embed.aspx?src=' + viewUrl} title='DocViewer' width='700px' height='600px'/> */}
                <iframe src={'https://docs.google.com/viewer?url=' + viewUrl + '&embedded=true'} title='DocViewer' width='700px' height='600px' />
            </div>
        );
    }
    
};

export default FileHome;