import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { VideoGAPI } from 'src/app/models/videoGAPI.interface';
import { WatchComponent } from '../watch/watch.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Preference } from 'src/app/models/preference.interface';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { VideoService } from '../../services/video.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableComponent implements OnInit {

  @Input() videos: VideoGAPI[];
  ratingArr: number[] = [0, 1, 2, 3, 4];
  dataSource = null;
  columnsToDisplay = ['categorie', 'channelTitle', 'title', 'publishedAt', 'rating'];
  expandedElement: VideoGAPI | null;
  @Output() refresh: EventEmitter<{ preference: Preference }> = new EventEmitter<{ preference: Preference }>();
  h1: string = null;
  loading: boolean = false;
  @Input() preference: Preference = {
    matSliderValue: 4,
    radioBackEnd: "FIREBASE",
    radioDataBase: "FIRESTORE",
    switchDiscogs: true,
    maxResultsDiscogs: 50,
    switchWikipedia: true,
    switchYoutube: true,
    maxResultsYoutube: 12,
    orderYoutube: "RELEVANCE"
  }

  constructor(public dialog: MatDialog,
    private _sanitizer: DomSanitizer,
    private _bottomSheet: MatBottomSheet,
    private videoService: VideoService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true
    this.route.queryParams.subscribe(params => {
      if (params.q == '' || params.q == undefined) {
        this.videoService.findAll().subscribe((items: any) => {
          this.videos = items;
          this.h1 = `(${items.length}) Vidéos - Toute catégorie confondue`;
          this.dataSource = new MatTableDataSource(this.videos);
          this.loading = false;
        });
      } else {
        this.videoService.findByCategorie(params.q).subscribe((items: any) => {
          this.videos = items;
          this.h1 = `(${items.length}) Vidéos - Catégorie : ${params.q}`;
          this.dataSource = new MatTableDataSource(this.videos);
          this.loading = false;
        });
      }
    
  })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  showIcon(element: VideoGAPI, index: number) {
    if (element.rating >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }

  openDialog(element: VideoGAPI): void {
    this.dialog.open(WatchComponent, {
      width: '432px',
      data: {
        video: {
          videoId: element.videoId,
          publishedAt: element.publishedAt,
          title: element.title,
          description: element.description,
          thumbnail: element.thumbnail,
          channelTitle: element.channelTitle,
          src: element.src,
          sanitized: this._sanitizer.bypassSecurityTrustResourceUrl(element.src),
          categorie: element.categorie,
          extractWiki: element.extractWiki,
          rating: element.rating
        },
        preference: {
          radioDataBase: this.preference.radioDataBase,
          radioBackEnd: this.preference.radioBackEnd
        }
      }
    });
  }

  openBottomSheetCate(element: VideoGAPI): void {
    let data = { video: element, preference: this.preference, categorie: true };
    this._bottomSheet.open(BottomSheetComponent, { data: data });
  }

  openBottomSheetWiki(element: VideoGAPI): void {
    let data = { video: element, preference: this.preference, wiki: true };
    this._bottomSheet.open(BottomSheetComponent, { data: data });
  }

  delete(element: VideoGAPI): void {
    let data = { video: element, preference: this.preference };
    this.videoService.deleteVideo(data).subscribe(item => {
      this._snackBar.open(data.video.title, " supprimé.", { duration: 5000, });
      setTimeout( () => { this.refreshTable() }, 3000)
    });
  }
}
