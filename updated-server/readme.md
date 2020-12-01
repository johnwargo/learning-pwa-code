# Updated Server Code

Throughout the book, the sample applications used in the chapters 3 through 5 use a server application that leverages the Bing News Search API. On October 29, 2020, Microsoft announced that "Bing Search APIs will transition from Azure Cognitive Services to Azure Marketplace on 31 October 2023."  This means that some of the content and source code won't work correctly in certain circumstances (described below).

In the announcement, Microsoft said:

> "The existing instances of the following Bing Search APIs under Azure Cognitive Services will no longer be supported after 31 October 2023. You can continue to create new instances of Bing Search APIs under the Azure Marketplace."

Existing Bing Search API keys will continue to work until the 2023 deadline, but Microsoft removed the ability to create new API keys for the service I used in the book and server code. This means that the content and server source code used in Chapter 3 is no longer valid for **new** readers.

Existing readers who already created their Bing Search API keys to use with the book's code can continue to do so, and all of the existing code in other folders in this repository will continue to operate as expected (until October 31, 2023). After that date, readers must switch to the new API and updated server code found in this folder.

## Instructions

If you created your Bing Search API keys before October 29, 2020, go ahead and use the content in the book and the main code in this repo as you work through the book. There's no need to continue reading this file.

If you didn't create your Bing Search API keys before October 29, 2020, then you must use the following instructions:

In Chapter 3, where the book tells readers to create a new API key using this link:  [https://portal.azure.com/#create/Microsoft.CognitiveServicesBingSearch-v7](https://portal.azure.com/#create/Microsoft.CognitiveServicesBingSearch-v7); that no longer works. Readers must instead use [https://portal.azure.com/#create/Microsoft.BingSearch](https://portal.azure.com/#create/Microsoft.BingSearch) to create a new API key to use with the book's code.

To help with the process, I added a Word and PDF versions of printable instructions (`updated-bing-api-instructions`) to this folder so you can print them out and stick them inside the book at page 50 for future reference.

The server code used by the book requires changes to work with the new API keys, so if you switch to the new search API keys, you must also switch to using the server code located in this folder of the repository.  

For Chapters 3 through 5, where the book tells you to use the chapter's code in the repo, for example `\learning-pwa-code\chapter-##\`, you must pull the code from a different folder; the code is now in the repository's `updated-server` folder (`\learning-pwa-code\updated-server\chapter-##\`).

Here's an example from Chapter 3:

>  Once the cloning process completes, navigate the terminal into the cloned project’s \learning-pwa-code\chapter-03\ folder. This folder contains the PWA News server application and that’s where we’ll work.

The new instructions are:

>  Once the cloning process completes, navigate the terminal into the cloned project’s \learning-pwa-code\updated-server\chapter-03\ folder. This folder contains the PWA News server application and that’s where we’ll work.

I know this is an inconvenience, but this is out of my control. If you have any issues working with these instructions or if you have feedback for how I can make this clearer or easier to use, please create an [issue](https://github.com/johnwargo/learning-pwa-code/issues) in the repository and I will respond from there.