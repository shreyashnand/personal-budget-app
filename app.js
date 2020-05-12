//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// Budget Controller ///////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
var budgetController= (function(){

    var Expense = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };

    Expense.prototype.calcPercentage= function(totalIncome){
        if(totalIncome>0){
            this.percentage=  Math.round((this.value/totalIncome)*100);
        } else{
            this.percentage=-1;
        }
    };

    Expense.prototype.getPercentage=function(){
        return this.percentage;
    };


    var Income = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };


    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type]=sum;
    };

    // Global data model
    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };

    

    return {
        addItem: function(type, des, val){
            var newItem, ID;
            // Create new ID
            if(data.allItems[type].length>0){
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }else{
                ID=0;
            }
            

            // Create new item based on inc or exp
            if(type==='exp'){
                newItem = new Expense(ID, des, val);
            }else if(type==='inc'){
                newItem = new Income(ID, des, val);
            }
            // Pushing it into data structure
            data.allItems[type].push(newItem);
            // Return new element
            return newItem;
        },

        deleteItem:function(type, id){
            var ids, index;
            ids= data.allItems[type].map(function(current){
                return current.id;

            });
            index=ids.indexOf(id);

            if(index !==-1){
                data.allItems[type].splice(index, 1)
            }

        },

        calculateBudget:function(){
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budget: income-expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage of income spent
            if(data.totals.inc > 0){
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            }else{
                data.percentage=-1;
            }
            
        },

        calculatePercentages:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);

            });

        },
        
        getPercentages: function(){
            var allPerc= data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;

        },

        getBudget:function(){
            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            }
        }
    };

 
})();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// UI Controller ///////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

var UIController=(function(){

        // For centralizing selectors
    var DOMstrings={
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        

    };

    var formatNumber=function(num, type){

        /* 
        + or - before a number in UI { income of 20000 = +20000 and expenses of 400 = -400}
        exactly 2 decimal points  {234.4546= 234.45}
        comma separating the total sum of expenses and income which are in thousands {2000 = 2,000}
        */

        num = Math.abs(num);  // to remove signs
        num = num.toFixed(2); // for decimal points
        var numSplit= num.split('.') // comma separation
        var int = numSplit[0];
        if(int.length > 3){
           int= int.substr(0, int.length - 3 ) + ',' + int.substr(int.length - 3,int.length); //  26262 = 26,262
        }
        var dec= numSplit[1]; 
        return (type ==='exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach= function(list, callback){
        for(var i=0; i<list.length;i++){
            callback(list[i],i);
        }

    };



    return {
        getInput: function(){
            // method for returning all the inputs in UI
            return{ 

            type:document.querySelector(DOMstrings.inputType).value, //either income or expense
            description:document.querySelector(DOMstrings.inputDescription).value,
            value:parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };

        },
        addListItem:function(obj, type){


            var html, newHtml, element;
            // Create html string with placeholder text
            if(type==='inc'){
                element= DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button</div></div</div>';

            }else if(type==='exp'){
                element=DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description% </div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }


            // Replace placeholder with actual data

            newHtml =html.replace('%id%', obj.id);
            newHtml =newHtml.replace('%description%', obj.description);
            newHtml =newHtml.replace('%value%', formatNumber(obj.value, type));


            // Insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem:function(selectorID){

            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields:function(){
            var fields;
            fields=document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            var fieldsArray= Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index,array) {
                current.value="";
            });
            fieldsArray[0].focus();
        },

        displayPercentages:function(percentages){
            var fields= document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index]>0){
                    current.textContent=percentages[index] + '%';
                } else{
                    current.textContent='---'
                }

                

            });

        },

        displayMonth: function(){
            var now= new Date();
            var year = now.getFullYear();
            var months=['January', 'February','March','April','May','June','July','August','September','October','November','December'];
            var month= now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent= months[month] + ' ' + year;
        },

        changedType:function(){
            var fields=document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            )
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');

            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')

        },
        
        getDOMstrings:function(){
            return DOMstrings;
        },

        displayBudget:function(obj){

            var type;
            obj.budget>0 ? type='inc' : type='exp'
            document.querySelector(DOMstrings.budgetLabel).textContent= formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc , 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent='---';
            }

        }
    }
})();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////// Global App controller ///////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

var controller=(function(budgetCtrl, UICtrl){

    // initialization
    var setupEventlisteners= function(){

        var DOM =UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAdditem);

        // key press event
        document.addEventListener('keypress', function(event){
        if(event.keyCode===13){
            ctrlAdditem();
        }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    // Budget function
    var updateBudget =function(){

        // Calculate budget
        budgetCtrl.calculateBudget();
        // Return budget
        var budget= budgetCtrl.getBudget();
        // Display budget on ui
        UICtrl.displayBudget(budget);
    };

    var updatePercentages= function(){
        
        // Calculate percentages
        budgetCtrl.calculatePercentages();

        // Read percentages from UI
        var percentages= budgetCtrl.getPercentages();

        // Update UI
        UICtrl.displayPercentages(percentages);

    };

    // Add item function
    var ctrlAdditem = function(){

        var input, newItem;

        // Get the filed input data
        input = UICtrl.getInput();
        
        if(input.description!=="" && !isNaN(input.value) && input.value>0){

                // Add item to budget controller
                newItem= budgetCtrl.addItem(input.type, input.description, input.value);

                // Add the tiem to ui

                UICtrl.addListItem(newItem, input.type);

                // Clearning fields
                UICtrl.clearFields();

                // Calculate and update budget
                updateBudget();

                // Calculate and update percentages
                updatePercentages();
        }  
    };

    // Delete Item function
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID= event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID=itemID.split('-');
            type=splitID[0];
            ID= parseInt(splitID[1]);

            // Delete item from data structure
            budgetCtrl.deleteItem(type,ID);

            // Delete item from UI
            UICtrl.deleteListItem(itemID);

            // Update new buget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }

    };


    
    return {
        init:function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1
            });
            setupEventlisteners();
            
        }
    };

})(budgetController, UIController);
controller.init();
