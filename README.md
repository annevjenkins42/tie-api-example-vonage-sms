# tie-api-example-nexmo-sms
This example Node.js connector enables a Teneo bot to communicate with users by receiving and sending SMS messages. The connector acts as middleware between Nexmo SMS API and a Teneo bot to implement SMS communication with persisting state and conversational position. Visit [Nexmo](https://developer.nexmo.com/api/sms) for more information.

## Prerequisites
### Teneo Engine
Your bot needs to be published and you need to know the engine url.

### Nexmo SMS API
A [Nexmo](https://dashboard.nexmo.com/sign-up) account with a `Virtual Phone Number` configured in it.
The steps to setup the account, configure Billing, and buying a virtual number are described ahead.

_Important:_ Adding funds is required to buy a `Virtual Phone Number`. €10 will suffice to purchase a number and send many SMS.

### HTTPS
A [Heroku](https://www.heroku.com/home) account is required to deploy the connector online.

Or,

to run the connector locally, [ngrok](https://ngrok.com/) is preferred to make the connector available via HTTPS.


## Nexmo Setup Instructions
To setup communication wit SMS messages between a Teneo bot and Nexmo SMS API the follow these steps:
1. Register an account [here](https://dashboard.nexmo.com/sign-up).
2. Set up Billing
    From your new account's dashboard, open [Billing and Payment](https://dashboard.nexmo.com/billing-and-payments).
    Set up a payment method and add €10 to your funds. €10 should be enough to purchase a virtual SMS phone number for around     2€ or €4, and send many SMS for a few cents each. [Pricing](https://dashboard.nexmo.com/pricing) varies per country.
3. Buy a `Virtual Phone Number`
    Open the [Buy Number](https://dashboard.nexmo.com/buy-numbers) section your Nexmo dashboard.
    Select your country to obtain cheaper rates, set features to `SMS`, set Type as `Mobile`, and click `Search`.
    Choose a number from the list, click `Buy`. Note: The process of buying virtual phone numbers may vary across countries.
  

## Connector Setup Instructions
Two ways of running this connector are described ahead. The first way, is by [running the connector online with Heroku](#running-the-connector-on-heroku). This is the easiest to get the connector running for non-developers since it does not require you to run Node.js or download or modify any code.

The second way is to [run the connector locally](#running-the-connector-locally) or to deploy it on a server of your choice. This is preferred if you're familiar with node.js development and want to have a closer look at the code, or implement modifications and enhancements.

### Running the connector on Heroku
Click the button below to deploy the connector to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg?classes=heroku)](https://heroku.com/deploy?template=https://github.com/artificialsolutions/tie-api-example-nexmo-sms)

In the 'Config Vars' section, add the following:
* **NEXMO_API_KEY** Use the `API key value` of your Nexmo account, found in [Settings](https://dashboard.nexmo.com/settings).

* **NEXMO_API_SECRET** Use the `APU Secret 1`, also found in [Settings](https://dashboard.nexmo.com/settings).

* **NEXMO_NUMBER** Use the Virtual Phone Number found [here](https://dashboard.nexmo.com/your-numbers) purchased previously, in E.164 format. 

    *Important:* The country code used `NEXMO_NUMBER` in must always have 3 digits, so add zero(es) to the left of country      code to fulfill this requirement when needed.  
    Example:
    
  -For a Spanish Virtual Phone Number `6000 00000`, with the country code `+34`, set `NEXMO_NUMBER` to `+034600000000`. 

  -For a US Virtual Phone Number `2000 000000`, with the country code `+1`, set `NEXMO_NUMBER` to `+0012000000000`.

* **TENEO_ENGINE_URL:** The engine url of your bot.

* **PORT** (Optional) Set a specific port value, or leave this field blank to use 1337 by default (recommended).

Click on `Deploy App`, and wait for Heroku to complete the deployment. Click `View` to see your new Heroku's app URL. Copy it, we will use it as a `Incoming Webhook URL` in the final step below.

Finally, in your Nexmo account's dashboard, [navigate](https://dashboard.nexmo.com/your-numbers) to the Virtual Phone Number you     purchased in the previous step, and click on `Manage`.
Now, set `Inbound Webhook URL` to:
`<yourproject.herokuapp.com/teneochat>`. Notice that the path `/teneochat` was added to the end of the URL.
Also, ensure your default SMS [settings](ttps://dashboard.nexmo.com/settings) are set to HTTP Method of `POST`.

That's it! Text your `Virtual Phone Number` with a mobile phone, and the Teneo bot will send an SMS reply!

### Running the connector locally
The local deployment of this connector allows the enhancement and modification of its functionalities.
If you want to run the connector locally, follow the steps below. 
1. Download or clone the connector source code:
    ```
    git clone https://github.com/artificialsolutions/tie-api-example-nexmo-sms.git
    ```
2. Install dependencies by running the following command in the folder where you stored the source:
    ```
    npm install
    ``` 
3. Create a file called `.env` in the `tie-api-example-nexmo-sms` folder. Replace the dummy URL with Teneo Engine URL of your bot). "API key" and "API Secret" are found in [Settings](https://dashboard.nexmo.com/settings)
    ```
    TENEO_ENGINE_URL=<your_engine_url>
    NEXMO_API_KEY=<your "API key" value>
    NEXMO_API_SECRET=<your "API Secret 1" value>
    NEXMO_NUMBER=<Virtual Phone Number>  #use E.164 format. For example: `+034600000000` or +0012000000000 
    #Optional parameters:
    #PORT=<Port>  #Uncomment to set a port number, otherwise 1337 will be used by default.
    ```
4. Start the connector:
    ```
    node server.js
    ```

Next, we need to make the connector available via https. We'll use [ngrok](https://ngrok.com) for this.

1. Start ngrok. The connector runs on port 1337 by default, so we need to start ngrok like this:
    ```
    ngrok http 1337
    ```
2. Running the command above will display a public https URL. Copy it, we will use it as a `Incoming Webhook URL` in the final step below.

3. Inside your Nexmo account's dashboard, [navigate](https://dashboard.nexmo.com/your-numbers) to the Virtual Phone Number you     purchased in the previous step, and click on `Manage`.
Now, set `Inbound Webhook URL` to:
`<https://abcd1234.ngrok.io/teneochat>`. Notice that the path `/teneochat` was added to the end of the URL.
Also, ensure your default SMS [settings](ttps://dashboard.nexmo.com/settings) are set to HTTP Method of `POST`.

That's it! Text your `Virtual Phone Number` with a mobile phone, and the Teneo bot will send an SMS reply!