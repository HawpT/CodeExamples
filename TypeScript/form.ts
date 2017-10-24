/**
 * This is a typescript module I wrote which uses the Angular 4 Form Builder
 * to manage and validate a form with some dynamic data.
 */

//Angular
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Headers, Http, Response, RequestMethod, ResponseContentType, URLSearchParams, RequestOptions } from '@angular/http';

//Services
import { PurchaseOrderService } from '../services/purchase-order.service';

// PrimeNG
import { DropdownModule } from 'primeng/primeng';

// Import models
import { PurchaseOrder } from '../models/purchase-order.model';
import { PurchaseOrderHeader } from '../models/purchase-order-header.model';
import { PurchaseOrderItem } from '../models/purchase-order-item.model';
import { MaterialTransfer } from '../models/material-transfer.model';

@Component({
    selector: 'app-po-create',
    templateUrl: './po-create.component.html'
})
export class PurchaseOrderCreateComponent implements OnInit {
    createPoForm: FormGroup;
    createHeaderDisplay: boolean;
    poType: String;
    @Input() purchaseOrder: PurchaseOrder;
    selectedItem: PurchaseOrderItem;

    constructor(private fb: FormBuilder, private services: PurchaseOrderService) { }

    ngOnInit(): void {
        this.createPoForm = this.fb.group({
            purchasetype: ['standard', [Validators.required]],
            vendorid: ['', [Validators.required]],
            vendorname: [{value: '', disabled: true}],
            shipaddress: [{value: '', disabled: true}],
            freightterms: [{value: '', disabled: true}],
            payterms: [{value: '', disabled: true}],
            vendorcomment: [{value: '', disabled: true}],
            insidecomment: [{value: '', disabled: true}],
            projectid: [{value: '', disabled: true}, [Validators.required]],
            projectname: [{value: '', disabled: true}],
            //TO-DO updated enteredby value to reflect user
            enteredby: [{value: '', disabled: true}],
            items: this.fb.array([]),
            services: this.fb.array([])
        });

        if (!this.purchaseOrder) {
            this.purchaseOrder = new PurchaseOrder();
            this.purchaseOrder.PurchaseOrderHeader = new PurchaseOrderHeader();
            this.purchaseOrder.PurchaseOrderItems.push(new PurchaseOrderItem());
            this.selectedItem = this.purchaseOrder.PurchaseOrderItems[0];
            (this.createPoForm.get('items') as FormArray).push(this.initItem());
            (this.createPoForm.get('services') as FormArray).push(this.initServiceItem());
        } else {
            this.fillFromExistingPO();
            console.log(this.purchaseOrder);
            console.log(this.createPoForm);
        }

        this.poType = this.createPoForm.get('purchasetype').value;
        //console.log(this.createPoForm.controls.items[0].controls);
        this.createHeaderDisplay = true;
    }

    /**
     * Populate the FormBuilder form with any incoming data from the PurchaseOrderService
     */
    fillFromExistingPO() {
        this.createPoForm.get('shipaddress').enable();
        this.createPoForm.get('freightterms').enable();
        this.createPoForm.get('payterms').enable();
        this.createPoForm.get('vendorcomment').enable();
        this.createPoForm.get('insidecomment').enable();
        this.createPoForm.get('projectid').enable();
        this.createPoForm.get('shipaddress').setValue(this.purchaseOrder.PurchaseOrderHeader.ShipAddress);
        this.createPoForm.get('freightterms').setValue(this.purchaseOrder.PurchaseOrderHeader.FreightTerms);
        this.createPoForm.get('payterms').setValue(this.purchaseOrder.PurchaseOrderHeader.PayTerms);
        this.createPoForm.get('vendorcomment').setValue(this.purchaseOrder.PurchaseOrderHeader.VendorComment);
        this.createPoForm.get('insidecomment').setValue(this.purchaseOrder.PurchaseOrderHeader.InsideComment);
        this.createPoForm.get('projectid').setValue(this.purchaseOrder.PurchaseOrderHeader.ProjectId);
        this.createPoForm.get('projectname').setValue(this.purchaseOrder.PurchaseOrderHeader.ProjectTitle);
        this.createPoForm.get('enteredby').setValue(this.purchaseOrder.PurchaseOrderHeader.EnteredBy);
        this.createPoForm.get('vendorid').setValue(this.purchaseOrder.PurchaseOrderHeader.VendorId);
        this.createPoForm.get('vendorname').setValue(this.purchaseOrder.PurchaseOrderHeader.VendorName);
        

        if ( this.purchaseOrder.PurchaseOrderHeader.PurchaseType === 'std' ) {
            for ( let i = 0; i < this.purchaseOrder.PurchaseOrderItems.length; ++i ) {
                let tempFormGroup = this.initItem();
                let tempItem: PurchaseOrderItem = this.purchaseOrder.PurchaseOrderItems[i];

                tempFormGroup.get('partnumber').setValue(tempItem.PartNumber);
                tempFormGroup.get('quantity').setValue(tempItem.Quantity);
                tempFormGroup.get('price').setValue(tempItem.Price);
                tempFormGroup.get('vendorspec').setValue(tempItem.VendorSpecification);
                tempFormGroup.get('duedate').setValue(tempItem.DueDate);
                tempFormGroup.get('partnumber').setValue(tempItem.PartNumber);

                //MTRs
                for ( let j = 0; j < tempItem.PurchaseOrderMaterialTransfer.length; ++j) {
                    let tempMTRGroup = this.initMTR();
                    let mtr: MaterialTransfer = tempItem.PurchaseOrderMaterialTransfer[j];

                    tempMTRGroup.get('partnumber').setValue(mtr.PartNumber);
                    tempMTRGroup.get('requestedquantity').setValue(mtr.RequestQuantity);
                    tempMTRGroup.get('duedate').setValue(mtr.DueDate);
                    tempMTRGroup.get('comment').setValue(mtr.Comments);
                    tempMTRGroup.get('statedprice').setValue(mtr.StatedPrice);
                    tempMTRGroup.get('createddate').setValue(mtr.CreateDate);
                    tempMTRGroup.get('fromproject').setValue(mtr.FromProject);
                    tempMTRGroup.get('toproject').setValue(mtr.ToProject);
                    tempMTRGroup.get('transferdate').setValue(mtr.TransferDate);
                    tempMTRGroup.get('status').setValue(mtr.Status);

                    (tempFormGroup.get('items') as FormArray).push(tempMTRGroup);
                }

                //WMTRs
                for ( let j = 0; j < tempItem.PurchaseOrderMaterialTransfer.length; ++j) {
                    let tempWMTRGroup = this.initMTR();
                    let wmtr: MaterialTransfer = tempItem.PurchaseOrderWorkMaterials[j];

                    tempWMTRGroup.get('partnumber').setValue(wmtr.PartNumber);
                    tempWMTRGroup.get('requestedquantity').setValue(wmtr.RequestQuantity);
                    tempWMTRGroup.get('duedate').setValue(wmtr.DueDate);
                    tempWMTRGroup.get('comment').setValue(wmtr.Comments);
                    tempWMTRGroup.get('statedprice').setValue(wmtr.StatedPrice);
                    tempWMTRGroup.get('createddate').setValue(wmtr.CreateDate);
                    tempWMTRGroup.get('fromproject').setValue(wmtr.FromProject);
                    tempWMTRGroup.get('toproject').setValue(wmtr.ToProject);
                    tempWMTRGroup.get('transferdate').setValue(wmtr.TransferDate);
                    tempWMTRGroup.get('status').setValue(wmtr.Status);

                    (tempFormGroup.get('items') as FormArray).push(tempWMTRGroup);
                }

                (this.createPoForm.get('items') as FormArray).push(tempFormGroup);
            }
        }
    }

    purchasetypeChange(event: Event) : void {
        this.poType = this.createPoForm.get('purchasetype').value;
        this.createPoForm.get('vendorid').enable();
    }

    vendoridChange(event: Event) : void {
        if (this.createPoForm.get('vendorid').value.length > 0) {
            this.createPoForm.get('shipaddress').enable();
            this.createPoForm.get('freightterms').enable();
            this.createPoForm.get('payterms').enable();
            this.createPoForm.get('vendorcomment').enable();
            this.createPoForm.get('insidecomment').enable();
            this.createPoForm.get('projectid').enable();
            //TO-DO Populate Vendor name from ID
        } else {
            this.createPoForm.get('shipaddress').disable();
            this.createPoForm.get('freightterms').disable();
            this.createPoForm.get('payterms').disable();
            this.createPoForm.get('vendorcomment').disable();
            this.createPoForm.get('insidecomment').disable();
            this.createPoForm.get('projectid').disable();
            this.createPoForm.get('vendorname').reset();
        }
    }

    projectidChange(event: Event) : void {
        if (this.createPoForm.get('vendorid').value.length > 0) {
            //this.createPoForm.get('projectname')
            //TO-DO Populate Project name from ID
        } else {
            this.createPoForm.get('projectname').reset();
        }

    }

    get items () {
        return this.createPoForm.get('items') as FormArray;
    }

    initServiceItem() {
        return this.fb.group({
            price: ['', [Validators.required]],
            vendorspec: ['', [Validators.required]],
            duedate: [''],
            mtrs: this.fb.array([])
        })
    }

    initItem() {
        let poItem = this.fb.group({
            partnumber: ['', [Validators.required]],
            quantity: ['', [Validators.required]],
            price: ['', [Validators.required]],
            vendorspec: [''],
            duedate: [''],
            mtrs: this.fb.array([]),
            wmtrs: this.fb.array([])
        });

        let mtrs = poItem.get('mtrs') as FormArray;
        mtrs.push(this.initMTR());

        let wmtrs = poItem.get('wmtrs') as FormArray;
        wmtrs.push(this.initMTR());

        return poItem;
    }

    initMTR() {
        return this.fb.group({
            partnumber: ['', [Validators.required]],
            requestedquantity: ['', [Validators.required]],
            duedate: [''],
            comment: [''],
            statedprice: [''],
            createddate: [''],
            fromproject: [''],
            toproject: [''],
            transferdate: [''],
            status: [''],

        })
    }

    addPOItem() : void {
        const arrayControl = <FormArray>this.createPoForm.controls.items;
        arrayControl.push(this.initItem())
    }

    addPOServiceItem() : void {
        const arrayControl = <FormArray>this.createPoForm.controls.services;
        arrayControl.push(this.initServiceItem())
    }

    removeObject(index: number): void {
        const arrayControl = <FormArray>this.createPoForm.controls.items;
        arrayControl.removeAt(index);
    }

    removeServiceObject(index: number): void {
        const arrayControl = <FormArray>this.createPoForm.controls.services;
        arrayControl.removeAt(index);
    }

    //addPurchaseOrder(PurchaseOrder:PO): Observable<PurchaseOrder> {
    
    //return this.http.post(this.url, book, options)
    //           .map(this.extractData)
    //           .catch(this.handleErrorObservable);
    //} 
    createPO(event) {
        let form = this.createPoForm.controls;

        let newpurchaseorder = new PurchaseOrder();
        let header = new PurchaseOrderHeader();

        header.VendorId = Number(form.vendorid.value);
        header.ShipAddress = form.shipaddress.value;
        header.FreightTerms = form.freightterms.value;
        header.PayTerms = form.payterms.value;
        header.VendorComment = form.vendorcomment.value;
        header.InsideComment = form.insidecomment.value;
        header.ProjectId = Number(form.projectid.value);
        header.PurchaseType = form.purchasetype.value;

        let items = []

        form.items.value.forEach(element => {
            let item = new PurchaseOrderItem();
            item.PartNumber = Number(element.partnumber);
            item.Quantity = Number(element.quantity);
            item.Price = Number(element.price);
            item.VendorSpecification = element.vendorspec;
            item.DueDate = element.duedate;

            items.push(item);
        });
        
        newpurchaseorder.PurchaseOrderHeader = header;
        newpurchaseorder.PurchaseOrderItems = items;

        // Post to API action
        this.services.postPurchaseOrder(newpurchaseorder).subscribe(response => {
            //console.log(response);
        })

        // Reset on success
        this.createPoForm.reset();

        // Error on failure
    }

    updatePO(event) {

    }

    cancel() {
        this.createPoForm.reset();
    }
}