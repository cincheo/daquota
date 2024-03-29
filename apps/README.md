
# Apps

You can open and modify the apps in the Daquota IDE just by cliking on the icons/names - *for more information on how it works, read the [getting started section](../README.md#getting-started)*.

## Local First Apps

| App (click to open/edit)    | Description   |
| :-------------: | ------------- |
| [![agenda](https://img.icons8.com/glyph-neue/64/FFFFFF/planner.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/agenda/agenda.json)<br>**[agenda](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/agenda/agenda.json)** | A simple local-first agenda.The agenda is responsive and switch to week mode on small screens. Users can create and edit events.<br>[JSON](agenda/agenda.json) |  
| [![contacts](https://img.icons8.com/glyph-neue/64/FFFFFF/contacts.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/contacts/contacts.json)<br>**[contacts](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/contacts/contacts.json)** | A simple local-first contact management application. It allows the users to create entries for persons and companies, and to export the contacts in a CSV file.<br>[JSON](contacts/contacts.json) |
| [![gantt](https://img.icons8.com/glyph-neue/64/FFFFFF/gantt-chart.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/gantt/gantt.json)<br>**[gantt](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/gantt/gantt.json)** | A simple local-first "gantt chart" editor. To demonstrate fexible layout capabilities, drag and drop, component resizing, ...<br>[JSON](gantt/gantt.json) |
| [![invoices](https://img.icons8.com/glyph-neue/64/FFFFFF/invoice.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/invoices/invoices.json)<br>**[invoices](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/invoices/invoices.json)** | A simple local-first invoice management application, to create invoices for companies that are created in the 'contacts' app above. Invoices can be exported in PDF. Thanks to low-code, it is easy to edit the app and change the invoice template if needed.<br>[JSON](invoices/invoices.json) |
| [![todolist](https://img.icons8.com/glyph-neue/64/FFFFFF/todo-list.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/todolist/todolist.json)<br>**[todolist](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/todolist/todolist.json)** | A simple local-first todolist application. Typical 1O1 example with due date and various options. Easy to extend for your own needs.<br>[JSON](todolist/todolist.json) |

## Local First Collaborative Apps (with multi-role worklows)

| App (click to open/edit)    | Description   |
| :-------------: | ------------- |
| [![absences](https://img.icons8.com/glyph-neue/64/FFFFFF/beach.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/absences/absences.json)<br>**[absences](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/absences/absences.json)** | A simple local-first absence-management application. In this application, users can create absence request they share with a manager. The manager can then accept or refuse the request (typical workflow). An agenda view sumarizes all the accepted absence requests so that the manager know who is available at any time.<br>[JSON](absences/absences.json) |
| [![expenses](https://img.icons8.com/glyph-neue/64/FFFFFF/purchase-order.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/expenses/expenses.json)<br>**[expenses](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/expenses/expenses.json)** | A PWA expense management app, with 18n and use of the camera. This application is meant to go mobile. You take the picture of your expense receipt, fill some info and share with your manager. The manager can accept or refuse the expense. This application is a good example to use for understanding eco-design issues since uploading photos can be quite resource-consuming.<br>[JSON](expenses/expenses.json) |
| [![kids](https://img.icons8.com/glyph-neue/64/FFFFFF/gingerbread-man.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/kids/kids.json)<br>**[kids](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/kids/kids.json)** | A simple collaborative local-first app, so that parents can agree on rewards for their kids.<br>[JSON](kids/kids.json) |

## Client/Server apps (API access)

| App (click to open/edit)    | Description   |
| :-------------: | ------------- |
| [![emissions](https://img.icons8.com/glyph-neue/64/FFFFFF/windy-weather--v1.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/emissions/emissions.json)<br>**[emissions](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/emissions/emissions.json)** | A simple application to visualize on a graph some gazes emissions from a public API. Note that the API is quite slow and the call may take several minutes to return some results.<br>[JSON](emissions/emissions.json) |
| [![metsearch](https://img.icons8.com/glyph-neue/64/FFFFFF/museum.png)](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/metsearch/metsearch.json)<br>**[metsearch](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/apps/metsearch/metsearch.json)** | A search engine that uses the public API of the MET museum. You can use this service to search for art in the MET. It demonstrate the use of the HTTP connector with some pagination and caching (a good example to use for understanding eco-design issues).<br>[JSON](metsearch/metsearch.json) |


## Apps for Eco Design

See [here](../eco-design/README.md).

# License

All apps in this directory are Open Source and can be used freely for commercial use.
