import { Component } from '@angular/core';
import { NavController, AlertController, reorderArray } from 'ionic-angular';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  data: any;
  items: any;
  completed: any;
  checked: any[];

  todos: FirebaseListObservable<any>;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public af: AngularFire) {
    //this.todos = af.database.list('/todos');
    this.completed = [];

    this.todos = this.af.database
            .list('/todos')
            .map(items => items.sort((a, b) => a.priority - b.priority)) as FirebaseListObservable<any[]>;

    this.todos.subscribe(items => {
      this.items = [];
      // items is an array
      items.forEach(item => {
        //console.log('Item:', item);
        if (item.status != "completed") {
          this.items.push(item);
        }
        else this.completed.push(item);
      });

      this.data = this.items;
    });

  }

  ionViewDidLoad() {

    /*
    this.items = [
      {id: 'Task 1', description: 'Description Juan', priority: 1, status: "pending"},
      {id: 'Task 2', description: 'Description Pepe', priority: 2, status: "pending"},
      {id: 'Task 3', description: 'Description Ana', priority: 3, status: "pending"}
    ];
    */

    //this.data = this.items;

  }

  getItems(ev: any) {
    // Reset items back to all of the items.
    this.items = this.data;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return (item.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  reorderItems(indexes) {
    console.log(indexes);
    let currentPriority = this.items[indexes.from].priority;
    let newPriority = this.items[indexes.to].priority;
    this.items = reorderArray(this.items, indexes);
    this.items[indexes.to].priority = newPriority;
    this.items[indexes.from].priority = currentPriority;

  }

  isChecked(item) {
    console.log(item);
    if (item.checked) {
      //item.status = "completed";
      //this.completed.push(item);
      //console.log(this.completed);
      this.deleteItem(item);
      this.todos.update(item.$key, {id: item.id, description: item.description, priority: item.priority, status: "completed"});
    }
  }

  addItem() {

    let taskIndex = 1;
    if (this.items.length != 0) {
      taskIndex = this.items.length + 1;
    }

    let prompt = this.alertCtrl.create({
      title: 'Añadir tarea',
      inputs: [
        {
          name: 'id',
          placeholder: 'ID',
          value: 'Task ' + taskIndex,
        },
        {
          name: 'description',
          placeholder: 'Descripción',
        },
        {
          name: 'priority',
          placeholder: 'Prioridad',
          type: 'number',

        }
      ],
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Añadir',
          handler: data => {
            data.status = 'pending';
            //this.items.push(data);
            this.todos.push(data);
          }
        }
      ]
    });

    prompt.present();
  }

  viewItem(item) {

    let prompt = this.alertCtrl.create({
      title: 'Detalles tarea',
      inputs: [
        {
          name: 'id',
          placeholder: 'id',
          value: item.id
        },
        {
          name: 'description',
          placeholder: 'Descripción',
          value: item.description

        },
        {
          name: 'priority',
          placeholder: 'Prioridad',
          type: 'number',
          value: item.priority

        },
        {
          name: 'status',
          placeholder: 'Estado',
          value: item.status

        }
      ]
    });

    prompt.present();

  }

  deleteItem(item) {

    let index = this.items.indexOf(item);

    if(index > -1){
      this.items.splice(index, 1);
      console.log(item);
      this.todos.remove(item.$key);
    }
  }

}
