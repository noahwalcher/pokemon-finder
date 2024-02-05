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
import { Observable, OperatorFunction, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { NgbTypeaheadModule, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgbTypeaheadModule, JsonPipe, FormsModule, RouterOutlet, MatInputModule, MatIconModule, MatTableModule, MatCheckboxModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  constructor(private http: HttpClient) { }

  title = 'pokemon-finder';

  moves: APIData[] = moves;
  abilities: APIData[] = abilities;
  generations: APIData[] = generations;
  myTypes: APIData[] = types;

  chosenTypes: APIData[] = [];
  chosenAbilities: APIData[] = [];
  chosenMoves: APIData[] = [];

  // displayedColumns: string[] = ['name'];
  // moveDataSource = new MatTableDataSource(moves);
  // abilityDataSource = new MatTableDataSource(abilities);
  // typeDataSource = new MatTableDataSource(types);
  // generationDataSource = new MatTableDataSource(generations);

  // moveModel = new SelectionModel<APIData>(true, []);
  // abilitiesModel = new SelectionModel<APIData>(true, []);
  // typesModel = new SelectionModel<APIData>(true, []);
  // generationsModel = new SelectionModel<APIData>(true, []);

  // clickedTypeRows = new Set<APIData>();
  // clickedMoveRows = new Set<APIData>();
  // clickedAbilityRows = new Set<APIData>();
  // clickedGenerationRows = new Set<APIData>();

  @ViewChild('instance', { static: true })
  instance: NgbTypeahead = new NgbTypeahead;

  typeFocus$ = new Subject<string>();
  typeClick$ = new Subject<string>();
  abilityFocus$ = new Subject<string>();
  abilityClick$ = new Subject<string>();
  moveFocus$ = new Subject<string>();
  moveClick$ = new Subject<string>();

  typeModel: APIData | undefined;
  abilityModel: APIData | undefined;
  moveModel: APIData | undefined;

  formatter = (apiData: APIData) => apiData.name.replace('-', ' ');

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

  onSelect($event: any, input: any, type: string) {
    $event.preventDefault();
    if (type == 'ability') {this.addAbility($event)};
    if (type == 'move') {this.addMove($event)};
    if (type == 'type') {this.addType($event)};

  };

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

  addMove(type: any) {
    if (!this.chosenMoves.includes(type) && type) {
      this.chosenMoves.push(type);
    }
  }

  searchTypes: OperatorFunction<string, readonly { name: string, url: string }[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.typeClick$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.typeFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === '' ? this.myTypes : this.myTypes.filter((v) => v.name.toLowerCase().indexOf(term.toLowerCase().replace(' ', '-')) > -1)).slice(0, 10),
      ),
    );
  }

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

  // handleRowClick(table: string, row: any) {
  //   if (table == 'moves') {
  //     this.clickedMoveRows.has(row) ? this.clickedMoveRows.delete(row) : this.clickedMoveRows.add(row);
  //   } else if (table == 'abilities') {
  //     this.clickedAbilityRows.has(row) ? this.clickedAbilityRows.delete(row) : this.clickedAbilityRows.add(row);
  //   } else if (table == 'generations') {
  //     this.clickedGenerationRows.has(row) ? this.clickedGenerationRows.delete(row) : this.clickedGenerationRows.add(row);
  //   } else if (table == 'types') {
  //     if (this.clickedTypeRows.size == 2) {
  //       this.clickedTypeRows.values();
  //     }
  //     this.clickedTypeRows.has(row) ? this.clickedTypeRows.delete(row) : this.clickedTypeRows.add(row);
  //   }
  // }

  // //TODO Revisit clear method
  // // Clears all selections on the given table
  // clearSelection(table: string) {
  //   if (table == 'moves') {
  //     this.moveModel.clear();
  //   } else if (table == 'abilities') {
  //     this.abilitiesModel.clear();
  //   } else if (table == 'types') {
  //     this.typesModel.clear();
  //   } else if (table == 'generations') {
  //     this.generationsModel.clear();
  //   }
  // }

  // Applies filtering on the table passed in based on input string
  // applyFilter(event: KeyboardEvent, table: string) {
  //   let filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  //   if (table == 'moves') {
  //     this.moveDataSource.filter = filterValue.trim().toLowerCase().replace(' ', '-');
  //   } else if (table == 'types') {
  //     this.typeDataSource.filter = filterValue.trim().toLowerCase().replace(' ', '-');
  //   } else if (table == 'abilities') {
  //     this.abilityDataSource.filter = filterValue.trim().toLowerCase().replace(' ', '-');
  //   } else if (table == 'generations') {
  //     this.generationDataSource.filter = filterValue.trim().toLowerCase().replace(' ', '-');
  //   }
  // }

  ngOnInit() {
    console.log(this.myTypes);


    // if (!this.pokemonList) {
    //   this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=2000').subscribe({
    //     next: (data) => {
    //       this.pokemonList = data;
    //       console.log(this.pokemonList);
    //     },
    //     error: (error) => {
    //       console.log(error)
    //     },
    //     complete: () => {
    //       console.log('complete')
    //     }
    //   })
    // } else {
    //   console.log('in else');
    // }
  }
}

