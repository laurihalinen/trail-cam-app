//Rekisteröityminen Cognitoon sähköpostilla ja salasanalla
const AWS = require('@aws-sdk/client-cognito-identity-provider'); //Cognito client
const { sendResponse, validateInput } = require('../helpers'); //Helper-funktiot
const { doccli } = require('../ddbconn'); //documentclient
const { PutCommand } = require('@aws-sdk/lib-dynamodb'); // DynamoDB:n PutCommand

//uusi identity provider
const cognito = new AWS.CognitoIdentityProvider();

//tietokanta taulu ympäristömuuttujista
const MAIN_TABLE = process.env.MAIN_TABLE;

module.exports.handler = async (event) => {
  try {
    // validateInput tarkistaa että bodyssa tuli oikeaa dataa
    const isValid = validateInput(event.body);
    if (!isValid) {
      return sendResponse(400, { message: 'Invalid input' });
    }

    // eventin body muodostuu sähköpostista ja salasanasta
    const { email, password } = JSON.parse(event.body);
    const { USER_POOL_ID } = process.env; // luetaan tarvittavat ympäristömuuttujat
    // Params-oliossa tiedot, jotka lähetetään Cognitoon käyttäjän luontia varten
    const params = {
      UserPoolId: USER_POOL_ID, //userpool, johon käyttäjä luodaan
      Username: email, //käyttäjän sähköposti
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true', //vahvistetaan sähköposti
        },
      ],
      // estetään automaattinen viesti siitä että käyttäjä luotiin Cognitoon
      MessageAction: 'SUPPRESS',
    };
    // luodaan käyttäjä cognitoon yllä olevien parametrien mukaisesti
    const response = await cognito.adminCreateUser(params);

    // luodaan käyttäjälle salasana cognitoon
    if (response.User) {
      const paramsForSetPass = {
        Password: password, //käyttäjän luoma salasana
        UserPoolId: USER_POOL_ID, //pooli, johon salasana asetetaan
        Username: email, //käyttäjän sähköposti tunnisteena
        Permanent: true, // pysyvä salasana
      };
      await cognito.adminSetUserPassword(paramsForSetPass);
    }
    // userId Cognito user-attribuuteista
    let userId = null;
    if (response.User?.Attributes) {
      const subAttr = response.User.Attributes.find(
        (attr) => attr.Name === 'sub',
      );
      if (subAttr) {
        userId = subAttr.Value; //uniikki userId
      }
    }

    // jos subia ei löydy fallback usernameen
    if (!userId && response.User?.Username) {
      userId = response.User.Username;
    }
    //current timestamp
    const now = new Date().toISOString();

    // käyttäjä-itemi joka tallennetaan tietokantaan
    const item = {
      PK: `USER#${userId}`,
      SK: `PROFILE#${userId}`,
      UserId: userId,
      Email: email,
      CreatedAt: now,
    };

    //tallennetaan käyttäjä tietokantaan
    await doccli.send(
      new PutCommand({
        TableName: MAIN_TABLE,
        Item: item,
      }),
    );

    // vastaus onnistuneesta rekisteröitymisestä
    return sendResponse(200, {
      message: 'User registration successful',
      userId,
    });
  } catch (error) {
    // virheilmoitus
    const message = error.message ? error.message : 'Internal server error';
    return sendResponse(500, { message });
  }
};
