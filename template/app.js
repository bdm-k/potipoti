"use strict";

// initlize variable:curretobj in getCumulativeSales
function init(e, l) {
    let obj = {
        time: e.time,
        data: []
    }
    for (let i = 0; i < l; i++) {
        obj.data.push({
            nums: 0,
            sales: 0
        });
    }
    obj.data[e.item_id].nums = e.num;
    obj.data[e.item_id].sales = e.num*e.price;
    return obj;
}

// recieve sales.json'object, return [object].
// look over Pull Request for the account of getCumulativeSales.
function getCumulativeSales(unprocessedobj) {
    let item_length = unprocessedobj.items.length, sales = unprocessedobj.sales;
    let cumulative = [], currentobj;
    if (sales.length === 1) {
        return [init(sales[0], item_length)]
    }
    for (let i = 0; i < sales.length; i++) {
        let event = sales[i]
        if (!currentobj) {
            currentobj = init(event, item_length);
            continue;
        }
        if ((new Date(event.time)).getMinutes() !== (new Date(currentobj.time)).getMinutes()) {
            cumulative.push(JSON.parse(JSON.stringify(currentobj)));
        }
        currentobj.time = event.time;
        currentobj.data[event.item_id].nums += event.num;
        currentobj.data[event.item_id].sales += event.num*event.price;
    }
    cumulative.push(Object.assign({}, currentobj));
    return cumulative
}

// makeGraphData makes data for the graph from the caumulative, which is return-value of getcumulativeSales.
function makeGraphData(cumulative, f) {
    let graphdata = [[], []];
    for (let i = 0; i < cumulative.length; i++) {
        let d = new Date(cumulative[i].time);
        graphdata[0].push(`${d.getHours()}:${d.getMinutes()}`);
        graphdata[1].push(f(cumulative[i].data));
    }
    return graphdata;
}

// initlizeGraphObj returns complete object for Chart constructor.
function initlizeGraphObj(l, d, name) {
    let graphObj = {
        type: 'line',
        data: {
            labels: l,
            datasets: [
                {
                    label: name,
                    pointRadius: 0,
                    data: d,
                    borderWidth: 1,
                    backgroundColor: "rgba(208,245,169)",
                    borderColor: "rgba(88,130,140)",
                    lineTension: 0
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                    xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'time'
                },
                ticks: {
                    maxTicksLimit: 6
                }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'sales'
                    }
                }]
            }
        }
    };
    return graphObj;
}

// makeNewDataSets returns one dataset, which is going to be used to update myChart. 
function makeNewDataSets(d, name, colors) {
    let obj = {
        label: name,
        pointRadius: 0,
        data: d,
        borderWidth: 1,
        backgroundColor: colors[0],
        borderColor: colors[1],
        lineTension: 0
    };
    return obj;
}

// Use axios to get sales.json's object.
function getJson() {
    return axios.get('https://potipoti.herokuapp.com/').then(response => response.data);
}

// property maker for 'ALL'.
function putTogether(arr, type) {
    return arr.reduce((accumulator, currentValue) => {
        return accumulator + currentValue[type];
    }, 0);
} 





var vm = new Vue({
    el: '#app',
    data: {
        // rightNow represents time
        rightNow: '',
        // products ids which is shown in the graph.
        selectedProductIds: [],
        // The index in this arr will be its productId.
        productNames: [],
// NOTE: colors needs to be set Manually.
        // each element of productColors is composed of [backgroundColor, borderColor]. This is for graph.
        productColors: [/*ALL*/["rgba(208,245,169)", "rgba(88,130,140)"]],
        // each element of productDetails is composed of {id, sales, nums}
        productDetails: [],
        // data made by getCumulativeSales.
        cumulative: [],
        // instance of Chart.
        myChart: null,
    },
    methods: {

        // receives productId and add its graph dataset to myChart.
        addDataSets(productId) {
            let d;
            if (this.productId === this.productNames.length - 1) {
                d = makeGraphData(this.cumulative, x => {
                    return x.reduce((accumulator, currentValue) => {
                        return accumulator + currentValue.sales
                    }, 0);
                })[1];
            } else {
                d = makeGraphData(this.cumulative, x => {
                    return x[productId].sales;
                })[1];
            }
            this.myChart.data.datasets.push(makeNewDataSets(d, this.productNames[productId], this.productColors[productId]));
            this.myChart.update();
            // initlize 
            this.selectedProductIds.push(productId);
        },

        // recieves productId and delete its graph dataset from myChart
        deleteDataSets(productId) {
            let productName = this.productNames[productId];
            this.myChart.data.datasets = this.myChart.data.datasets.filter(element => {
                return element.label !== productName
            });
            this.myChart.update();
            this.selectedProductIds = this.selectedProductIds.filter(element => {
                return element !== productId;
            });
        },

        // toggle functions as an interface to use addDataSets or deleteDataSets
        toggle(productId) {
            if (this.selectedProductIds.includes(productId)) {
                this.deleteDataSets(productId);
            } else {
                this.addDataSets(productId);
            }
        },
    },
    // mounted method is carried out immediately after DOM tree is build.
    // initialize every Vue property, including myChart.

    mounted() {
        getJson()
        .then(obj => {
            // initlize productNames
            for(let i = 0; i < obj.items.length; i++) {
                this.productNames.push(obj.items[i].name);
            }
            this.productNames.push('ALL');

            // initlize cumulative
            this.cumulative = getCumulativeSales(obj);

            // initlize rightNow
            let last = this.cumulative[this.cumulative.length - 1];
            let d = new Date(last.time);
            this.rightNow = `${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;

            // initialize productDetails
            for (let i = 0; i < last.data.length; i++) {
                this.productDetails.push(
                    {
                        id: i,
                        sales: last.data[i].sales,
                        nums: last.data[i].nums,
                    }
                );
            }
            this.productDetails.push({
                id: last.data.length,
                sales: putTogether(last.data, 'sales'),
                nums: putTogether(last.data, 'nums'),
            });

            // initlize myChart
            let graphdata = makeGraphData(this.cumulative, x => {
                return x.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue.sales
                }, 0);
            });
            this.myChart = new Chart(document.getElementById('myChart'), initlizeGraphObj(graphdata[0], graphdata[1], 'ALL'));

            // intialize selectedProductIds
            this.selectedProductIds.push(last.data.length);
        })
        .catch(error => {
            console.error(error);
        });
    }
});

// update vm.cumulative, rightNow, productDetails, and myChart every 60 seconds.
setInterval(() => {
    getJson()
    .then(obj => {
        vm.cumulative = getCumulativeSales(obj);
        let last = vm.cumulative[vm.cumulative.length - 1];
        
        // processes about time
        let d = new Date(last.time);
        vm.rightNow = `${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
        vm.myChart.data.labels.push(`${d.getHours()}:${d.getMinutes()}`);

        // processes about productDetails
        vm.productDetails = vm.productDetails.map(element => {
            if (element.id === vm.productNames.length - 1) {
                element.sales = putTogether(last.data, 'sales');
                element.nums = putTogether(last.data, 'nums');
            } else {
                element.sales = last.data[element.id].sales;
                element.nums = last.data[element.id].nums;
            }
        });

        // processes about data of myChart
        vm.myChart.data.datasets = vm.myChart.data.datasets.map(element => {
            let productId = vm.productNames.indexOf(element.label);
            element.data.push(vm.productDetails[productId].sales);
        });
        vm.myChart.update();
    })
    .catch(error => console.log(error));
}, 60*1000);



