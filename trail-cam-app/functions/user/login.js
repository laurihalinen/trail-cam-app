// Kirjautuminen Cognitoon sähköpostilla ja salasanalla

const AWS = require('@aws-sdk/client-cognito-identity-provider'); //Cognito client
const { sendResponse, validateInput } = require('../helpers'); //helper funktiot

// uusi identity provider
const cognito = new AWS.CognitoIdentityProvider();

module.exports.handler = async (event) => {
  try {
    // validateInput tarkistaa että bodyssa tuli oikeaa dataa
    const isValid = validateInput(event.body);
    if (!isValid) {
      return sendResponse(400, { message: 'Invalid input' });
    }

    // eventin body muodostuuu sähköpostista ja salasanasta
    const { email, password } = JSON.parse(event.body);
    //luetaan tarvittavat ympäristömuuttujat
    const { USER_POOL_ID, USER_CLIENT_ID } = process.env;

    // params-oliossa tiedot, jotka lähetetään Cognitoon autentikaatiota varten
    const params = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH', // autentikaatio usernamella(email) ja salasanalla
      UserPoolId: USER_POOL_ID, // käyttäjäpoolin tunniste
      ClientId: USER_CLIENT_ID, // sovelluksen tunniste
      AuthParameters: {
        USERNAME: email, //käyttäjän sähköposti
        PASSWORD: password, //käyttäjän salasana
      },
    };
    // suoritetaan autentikaatio cognitossa ja saadaan vastaus
    const response = await cognito.adminInitiateAuth(params);
    // jos autentikaatio onnistuu saadaan vastauksena JWT-token
    return sendResponse(200, {
      message: 'Success',
      token: response.AuthenticationResult.IdToken,
    });
  } catch (error) {
    //virheenkäsittely
    const message = error.message ? error.message : 'Internal server error';
    return sendResponse(500, { message });
  }
};
