
# Apps

You can open and modify the apps in the dLite IDE just by cliking on the icons/names - *for more information on how it works, read the [getting started section](../README.md#getting-started)*.

## Local First Apps

| App (click to open/edit)    | Description   | JSON Descriptor   |
| :-------------: | ------------- | ---- |
| [![agenda](https://img.icons8.com/stickers/100/planner.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/agenda/agenda.json)<br>**[agenda](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/agenda/agenda.json)** | A simple local-first agenda. The agenda is responsive and switch to week mode on small screens. Users can create and edit events. | [JSON](agenda/agenda.json) | 
| [![contacts](https://img.icons8.com/stickers/100/contacts.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/contacts/contacts.json)<br>**[contacts](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/contacts/contacts.json)** | A simple local-first contact management application. It allows the users to create entries for persons and companies, and to export the contacts in a CSV file. | [JSON](contacts/contacts.json) |
| [![gantt](https://img.icons8.com/stickers/100/gantt-chart.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/gantt/gantt.json)<br>**[gantt](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/gantt/gantt.json)** | A simple local-first "gantt chart" editor. To demonstrate fexible layout capabilities, drag and drop, component resizing, ... | [JSON](gantt/gantt.json) |
| [![invoices](https://img.icons8.com/stickers/100/invoice.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/invoices/invoices.json)<br>**[invoices](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/invoices/invoices.json)** | A simple local-first invoice management application, to create invoices for companies that are created in the 'contacts' app above. Invoices can be exported in PDF. Thanks to low-code, it is easy to edit the app and change the invoice template if needed. | [JSON](invoices/invoices.json) |
| [![todolist](https://img.icons8.com/stickers/100/todo-list.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/todolist/todolist.json)<br>**[todolist](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/todolist/todolist.json)** | A simple local-first todolist application. Typical 1O1 example with due date and various options. Easy to extend for your own needs. | [JSON](todolist/todolist.json) |

## Local First Collaborative Apps (with multi-role worklows)

| App (click to open/edit)    | Description   | JSON Descriptor   |
| :-------------: | ------------- | ---- |
| [![absences](https://img.icons8.com/stickers/100/sun-lounger.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/absences/absences.json)<br>**[absences](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/absences/absences.json)** | A simple local-first absence-management application. In this application, users can create absence request they share with a manager. The manager can then accept or refuse the request (typical workflow). An agenda view sumarizes all the accepted absence requests so that the manager know who is available at any time. | [JSON](absences/absences.json) |
| [![expenses](https://img.icons8.com/stickers/100/purchase-order.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/expenses/expenses.json)<br>**[expenses](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/expenses/expenses.json)** | A PWA expense management app, with 18n and use of the camera. This application is meant to go mobile. You take the picture of your expense receipt, fill some info and share with your manager. The manager can accept or refuse the expense. This application is a good example to use for understanding eco-design issues since uploading photos can be quite resource-consuming. | [JSON](expenses/expenses.json) |
| [![kids](https://img.icons8.com/stickers/100/prize.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/kids/kids.json)<br>**[kids](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/kids/kids.json)** | A simple collaborative local-first app, so that parents can agree on rewards for their kids. | [JSON](kids/kids.json) |

## Client/Server apps (API access)

| App (click to open/edit)    | Description   | JSON Descriptor   |
| :-------------: | ------------- | ---- |
| [![emissions](https://img.icons8.com/stickers/100/air-element.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/emissions/emissions.json)<br>**[emissions](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/emissions/emissions.json)** | A simple application to visualize on a graph some gazes emissions from a public API. Note that the API is quite slow and the call may take several minutes to return some results. | [JSON](emissions/emissions.json) |
| [![metsearch](https://img.icons8.com/stickers/100/museum.png)](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/metsearch/metsearch.json)<br>**[metsearch](https://platform.dlite.io/?src=https://raw.githubusercontent.com/cincheo/dlite/main/apps/metsearch/metsearch.json)** | A search engine that uses the public API of the MET museum. You can use this service to search for art in the MET. It demonstrate the use of the HTTP connector with some pagination and caching (a good example to use for understanding eco-design issues). | [JSON](metsearch/metsearch.json) |


## Apps for Eco Design

See [here](../eco-design/README.md).

# License

All apps in this directory are Open Source and can be used freely for commercial use.
