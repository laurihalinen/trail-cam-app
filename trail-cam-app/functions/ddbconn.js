// DynamoDB ja DocumentClientien luonti ja exporttaus
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// käytetään kantaa pilvestä eu-north-1 regionista
const ddbcli = new DynamoDBClient({ region: 'us-east-1' });

// määritykset kun muutetaan JS-tyypit DDB-tyypeiksi
const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
  convertClassInstanceToMap: false,
};

// määritykset kun muutetaan DDB-tyypit JS-tyypeiksi
const unmarshallOptions = {
  wrapNumbers: false,
};

// documentclient-olio
const doccli = DynamoDBDocumentClient.from(ddbcli, {
  marshallOptions,
  unmarshallOptions,
});

// exportataan dynamodbclient ja documentclient -oliot
module.exports = { doccli };
