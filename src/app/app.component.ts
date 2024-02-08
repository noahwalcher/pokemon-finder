import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import abilities from 'src/assets/abilities.json';
import generations from 'src/assets/generations.json';
import moves from 'src/assets/moves.json';
import types from 'src/assets/types.json';
import { APIData } from './APIData';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, OperatorFunction, Subject, forkJoin, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { NgbTypeaheadModule, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { CachingService } from './caching.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgbTypeaheadModule, JsonPipe, FormsModule, RouterOutlet, MatInputModule, MatIconModule, MatTableModule, MatCheckboxModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  constructor(private http: HttpClient, private cachingService: CachingService) { }

  title = 'pokemon-finder';

  // Arrays holding all moves, abilities, generations, and types
  moves: APIData[] = moves;
  abilities: APIData[] = abilities;
  generations: APIData[] = generations;
  types: APIData[] = types;

  // These arrays hold the values selected by the user
  chosenTypes: APIData[] = [];
  chosenAbilities: APIData[] = [];
  chosenMoves: APIData[] = [];

  // These variables are used for the typeahead stuff
  @ViewChild('instance', { static: true })
  instance: NgbTypeahead = new NgbTypeahead;
  typeFocus$ = new Subject<string>();
  typeClick$ = new Subject<string>();
  abilityFocus$ = new Subject<string>();
  abilityClick$ = new Subject<string>();
  moveFocus$ = new Subject<string>();
  moveClick$ = new Subject<string>();

  // Array of promises for all the API calls needed
  promiseArray: Promise<any>[] = [];

  // Used in the typeahead. Because moves/abilities with more than one word are separated by '-' in our list, account for that when searching by allowing ' ' or '-' to be used
  formatter = (apiData: APIData) => apiData.name.replace('-', ' ');

  // Whenever a value from one of the inputs is selected pass that value to the appropriate method. This method is also used to help clear the input after a selection is made with the preventDefault method
  onSelect($event: any, input: any, type: string) {
    $event.preventDefault();
    if (type == 'ability') { this.addAbility($event.item) };
    if (type == 'move') { this.addMove($event.item) };
    if (type == 'type') { this.addType($event.item) };
  };

  // Adds the chosen type to the user array. Limits to 2 types in the array
  addType(type: any) {
    if (!this.chosenTypes.includes(type)) {
      if (type && this.chosenTypes.length < 2) {
        this.chosenTypes.push(type);
      } else if (type && this.chosenTypes.length > 1) {
        this.chosenTypes.splice(2)
        this.chosenTypes.splice(0, 1);
        this.chosenTypes.push(type);
      }
    }
  }

  // Adds the chosen ability to the user array. Limits to 3 abilities in the array
  addAbility(type: any) {
    if (!this.chosenAbilities.includes(type)) {
      if (type && this.chosenAbilities.length < 3) {
        this.chosenAbilities.push(type);
      } else if (type && this.chosenAbilities.length > 2) {
        this.chosenAbilities.splice(3)
        this.chosenAbilities.splice(0, 1);
        this.chosenAbilities.push(type);
      }
    }
  }

  // Adds the chose move to the user array.
  addMove(type: any) {
    if (!this.chosenMoves.includes(type) && type) {
      this.chosenMoves.push(type);
    }
  }

  // Searches through the types list for a match on user's input.
  searchTypes: OperatorFunction<string, readonly { name: string, url: string }[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.typeClick$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.typeFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === '' ? this.types : this.types.filter((v) => v.name.toLowerCase().indexOf(term.toLowerCase().replace(' ', '-')) > -1)).slice(0, 10),
      ),
    );
  }

  // Searches through the ability list for a match on user's input.
  searchAbilities: OperatorFunction<string, readonly { name: string, url: string }[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.abilityClick$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.abilityFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === '' ? this.abilities : this.abilities.filter((v) => v.name.toLowerCase().indexOf(term.toLowerCase().replace(' ', '-')) > -1)).slice(0, 10),
      ),
    );
  }

  // Searches through the moves list for a match on user's input.
  searchMoves: OperatorFunction<string, readonly { name: string, url: string }[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.moveClick$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.moveFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === '' ? this.moves : this.moves.filter((v) => v.name.toLowerCase().indexOf(term.toLowerCase().replace(' ', '-')) > -1)).slice(0, 10),
      ),
    );
  }

  async findPokemon() {
    let pokemon: APIData[] = [];
    let endpoints: string[] = [];
    this.chosenTypes.forEach(element => {
      endpoints.push(element.url);
    });
    this.chosenAbilities.forEach(element => {
      endpoints.push(element.url);
    });
    this.chosenMoves.forEach(element => {
      endpoints.push(element.url);
    });
    const observables = endpoints.map(endpoint => this.cachingService.getData(endpoint));
    forkJoin(observables).subscribe(
      // Handle the array of responses when all requests complete
      (responses: any[]) => {
        responses.forEach((response, index) => {
          // Handle data for the corresponding endpoint
          let currentPokemon: APIData[] = [];
          if (response.pokemon) {
            response.pokemon.forEach((element: any) => {
              currentPokemon.push(element.pokemon);
            })
          } else if (response.learned_by_pokemon) {
            currentPokemon = response.learned_by_pokemon;
          }

          if (index == 0 && currentPokemon) {
            pokemon = currentPokemon;
            console.log('index zero: ' + JSON.stringify(pokemon));
          } else if (currentPokemon && pokemon) {
            pokemon = pokemon.filter(p => currentPokemon.some(cp => cp.name === p.name && cp.url === p.url));
            console.log('index ' + index + ': ' + JSON.stringify(pokemon));
          }
        });
        console.log(JSON.stringify(pokemon));
      },
      error => {
        // Handle error if any of the requests fail
        console.error('Error fetching data:', error);
      }
    );
  }
}