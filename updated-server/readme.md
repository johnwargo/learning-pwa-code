# Updated Server Code

Throughout the book, the sample applications used in the chapters three through 5 use a server application that leverages the Bing News Search API. On October 29, 2020, Microsoft announced that "Bing Search APIs will transition from Azure Cognitive Services to Azure Marketplace on 31 October 2023."  In the announcement, they said:

> "The existing instances of the following Bing Search APIs under Azure Cognitive Services will no longer be supported after 31 October 2023. You can continue to create new instances of Bing Search APIs under the Azure Marketplace."

Existing Bing Search API keys will continue to work until the 2023 deadline, but Microsoft removed the ability to create new API keys for the service I used in the book and server code. This means that the content and server source code used in Chapter 3 is no longer valid for new readers. Existing readers who already created their Bing Search API keys to use with the book's code can continue to do so, and all of the existing code in other folders in this repository will continue to operate as expected (until October 31, 2023). After that date, readers must switch to the new API and updated server code found in this folder.

In Chapter 3, where the book tells readers to create a new API key using the following link: [https://portal.azure.com/#create/Microsoft.CognitiveServicesBingSearch-v7](https://portal.azure.com/#create/Microsoft.CognitiveServicesBingSearch-v7); that will no longer work. Readers must use the following link instead: [https://portal.azure.com/#create/Microsoft.BingSearch](https://portal.azure.com/#create/Microsoft.BingSearch).

The server code used by the book requires changes to work with the new API keys, so if you switch to the new search API keys, you must also switch to using the server code located in this folder. 

this is a work in progress, so not ready for distribution yet.
