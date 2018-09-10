import {debounceTime} from 'rxjs/internal/operators';
import { Component, OnInit } from '@angular/core';
import { FormGroup, /*FormControl,*/ FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';
import { Customer } from './customer';

/* Version without parameters
function ratingRange(c:AbstractControl):{[key:string]:boolean}|null{
  if(c.value != undefined && (isNaN(c.value)||c.value<1||c.value>5)){
    return{'range':true};//validation didn't pass
  };
  return null;
};
*/

function ratingRange(min:number, max:number):ValidatorFn{
  return(c:AbstractControl):{[key:string]:boolean}|null=>{
    if(c.value != undefined && (isNaN(c.value)||c.value<min||c.value>max)){
      return{'range':true};//validation didn't pass
    };
    return null;
  }
};

function emailMatcher(c:AbstractControl){
  let emailControl = c.get('email');
  let confirmControl = c.get('confirmEmail');
  if(emailControl.pristine||confirmControl.pristine){
    return null;
  }
  if(emailControl.value === confirmControl.value){
    return null;
  }
  return{'match':true};
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm:FormGroup;
  customer:Customer = new Customer();
  emailMessage:string;

  get addresses():FormArray{
    return <FormArray>this.customerForm.get('addresses');
  }

  private validationMessages = {
    required: 'Please enter your email address.',
    pattern: 'Please enter a valid email address.',
    email: 'Please enter a valid email address.'
  }

  constructor(private fb:FormBuilder) { }

  ngOnInit():void {
    //This is the case if we don't use formbuilder

    // this.customerForm = new FormGroup({
    //   firstName:new FormControl(),
    //   last:new FormControl(),
    //   email:new FormControl(),
    //   sendCatalog:new FormControl(true)
    // });

    //formbuilder
    this.customerForm = this.fb.group({
      firstName:['', [Validators.required, Validators.minLength(3)]], //optional, object: {value:'', disabled:true}
      last:['', [Validators.required, Validators.maxLength(50)]],     //optional2, array: firstName:[''] or [{value:'', disabled:false}]
      emailGroup:this.fb.group({
        email:['',[Validators.required, Validators.email]], 
        confirmEmail:['',Validators.required],
      }, {validator:emailMatcher}),      
      phone:'',
      notification:'email',
      rating:['', ratingRange(1,5)],
      sendCatalog:true,
      addresses:this.fb.array([this.buildAddress()])
    });  
    
    this.customerForm.get('notification')
            .valueChanges.subscribe(value => this.setNotification(value));
    
    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(debounceTime(1000)).subscribe(value=>
      this.setMessage(emailControl));

      console.log(<FormArray>this.customerForm.get('addresses.controls'));
  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm));
  }

  setMessage(c:AbstractControl):void{
    this.emailMessage = '';
    if((c.touched||c.dirty)&&c.errors){
      this.emailMessage = Object.keys(c.errors).map(key=>
        this.validationMessages[key]).join(' ');
    }
  }

  buildAddress():FormGroup{
    return this.fb.group({
      addressType:'home',
      street1:'',
      street2:'',
      city:'',
      state:'',
      zip:''
    });
  }

  addAddress():void{
    this.addresses.push(this.buildAddress()); //first populated with getter
  }

  populateTestData():void{
    this.customerForm.setValue({
      firstName:'H',
      last:'M',
      email:'d@hotmail.comk',
      phone: 123,
      notification:'text',
      sendCatalog:false
    });
  }
  populatePartialTestData(){
    this.customerForm.patchValue({
      firstName:'A',
      last:'B',
    });
  }

  setNotification(notifyvia:string):void{
    const phoneControl = this.customerForm.get('phone');
    if(notifyvia==='text'){
      phoneControl.setValidators(Validators.required);
    }else{
      phoneControl.clearValidators();
    }
      phoneControl.updateValueAndValidity();
  }
}
