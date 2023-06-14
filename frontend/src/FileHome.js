import {useState, useEffect} from 'react';
import AWS, { config } from 'aws-sdk';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
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

const FileHome = () => {
    const [fileList, setFileList] = useState([]);
    const [viewUrl, setViewUrl] = useState("");
    const [fileType, setFileType] = useState("");
    const [allData, setAllData] = useState([]);
    const [number, setNumber] = useState(0);
    const [allVersions, setAllVersions] = useState([]);
    const [currentVersions, setCurrentVersions] = useState({}); // Stores current selected version of each file

    var theParams = {
        Bucket: 'projfilestoragebucket',
        Delimiter: '/',
    };

    const listAllFiles = async (allData) => {
        //const allData = await getDocuments();
        console.log(allData);

        for (const obj of allData) {
            setAllVersions(allVersions => [
                ...allVersions,
                getVersions(obj.Key)
            ])
            console.log(obj);
        }
        console.log(allVersions);

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
            allData.map((obj, idx) =>
                <>
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
                    <tr key={idx}>
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
                    <td>
                        Versions: 
                        <Form.Select onChange={changeVersion}>
                            {allVersions[idx].map((item, idx2) =>
                                <option key={idx2} name={obj.Key} value={item.VersionId}>
                                        {item.LastModified.toLocaleTimeString('en-US')
                                            + ', ' + item.LastModified.toLocaleDateString('en-US', options)}
                                    </option>
                                
                            )}
                        </Form.Select>
                    </td>
                </tr>
                </>
            )
        );
    };

    const changeVersion = (e) => {
        // let key = e.target.name;
        // let updatedValue = {key: e.target.value};
        // setVersions(versions => ({
        //     ...versions,
        //     ...updatedValue,
        // }));
        setCurrentVersions({[e.target.name]: e.target.value});
    };

    const downloadDocument = (key) => {
        const urlExpire = 120;

        if (key in currentVersions) {
            return theBucket.getSignedUrl('getObject', {
                Bucket: 'projfilestoragebucket',
                Key: key,
                VersionId: currentVersions[key],
                Expires: urlExpire
            });
        }

        return theBucket.getSignedUrl('getObject', {
            Bucket: 'projfilestoragebucket',
            Key: key,
            Expires: urlExpire
        });
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
        const urlExpire = 120;
        let signedUrl = '';

        if (key in currentVersions) {
            signedUrl = theBucket.getSignedUrl('getObject', {
                Bucket: 'projfilestoragebucket',
                Key: key,
                ResponseContentEncoding: 'base64',
                // ResponseContentType: 'application/pdf',
                ResponseContentDisposition: 'inline',
                VersionId: currentVersions[key],
                Expires: urlExpire
            });
        }
        else {
            signedUrl = theBucket.getSignedUrl('getObject', {
                Bucket: 'projfilestoragebucket',
                Key: key,
                ResponseContentEncoding: 'base64',
                // ResponseContentType: 'application/pdf',
                ResponseContentDisposition: 'inline',
                Expires: urlExpire
            });
        }

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

    const getDocuments = async() => {
        theBucket.listObjectsV2(theParams, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(data.Contents)
            // return data.Contents;
            listAllFiles(data.Contents);
        });
    };

    const getVersions = async(key) => {
        const params = {
            Bucket: 'projfilestoragebucket',
            Prefix: key
        };

        // , function(err, data) {
        //     if (err) console.log(err, err.stack);
        //     else {
        //         console.log(data.Versions);
        //         setNumber(number + 1); // Keep track of which files received their versions so far
        //         return data.Versions;
        //     }
        // }

        return await theBucket.listObjectVersions(params).promise().Versions;
    };

    useEffect(() => {
        (async() => {
           await getDocuments();
        })();
    
        console.log(viewUrl);
    }, [viewUrl]); // Reload app to render viewer

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
            <iframe src={'https://view.officeapps.live.com/op/embed.aspx?src=' + viewUrl} title='DocViewer' width='700px' height='600px'>This is an embedded <a target='_blank' rel="noreferrer" href='http://office.com'>Microsoft Office</a> document, powered by <a target='_blank' rel="noreferrer" href='http://office.com/webapps'>Office Online</a>.</iframe>

            </div>
        );
    }
    
};

export default FileHome;