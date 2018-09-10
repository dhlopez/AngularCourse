import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IProduct } from './product';

@Component({
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  pageTitle: string ='Product Detail';
  product: IProduct;


  constructor(private route:ActivatedRoute,
              private router:Router) {

  }

  ngOnInit() {
    let id = +this.route.snapshot.paramMap.get('id');
    this.pageTitle += `: ${id}`;
    this.product = {
      'productId':id,
      'productName':'Product Name',
      'productCode' : 'ABC1',
      'releaseDate' : '20180101',
      'description' : 'Test for ABC1',
      'price' : 12.22,
      'starRating' : 4.2,
      'imageUrl' : 'https://openclipart.org/detail/305521/doctor-8'
    }
  }

  onBack():void{
    this.router.navigate(['/products']);
  }

}
