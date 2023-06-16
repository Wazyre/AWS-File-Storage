import AWS, {config} from 'aws-sdk';

config.update({
    accessKeyId: '',
    secretAccessKey: '',
});

const callLambda = (fname, payload) => {
    const lambda = new AWS.Lambda({
        params: { Bucket: 'projfilestoragebucket' },
        region: 'us-east-2'
    });
    const params = {
        FunctionName: fname,
        Payload: JSON.stringify(payload),
    };
    return lambda.invoke(params).promise();
}