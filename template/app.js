"use strict";

function gapOfMinutues (x, y) {
    let gap = (x >= y) ? x - y : 0
    gap /= 60000;
    gap = Math.floor(gap);
    return gap
}
function initCurrentobj (event, numOfItems) {
    let obj = {
        time: event.time,
        data: []
    }
    for (let i = 0; i < numOfItems; i++) {
        obj.data.push({
            nums: 0,
            sales: 0
        });
    }
    obj.data[event.item_id].nums = event.num;
    obj.data[event.item_id].sales = event.num*event.price;
    return obj;
}
function putTogether (arr, type) {
    return arr.reduce((accumulator, currentValue) => {
        return accumulator + currentValue[type];
    }, 0);
}
function setRightNow (vueInstance) {
    let now = new Date();
    vueInstance.rightNow = `${now.getDate()} ${now.getHours()}:${now.getMinutes()}`
}
function setUsers (vueInstance, users) {
    vueInstance.users = users;
}
function setProductNames (vueInstance, items) {
    vueInstance.productNames = items.map(item => {
        return item.name;
    });
}
// the picture of currentobj
// {
//     time: 
//     data: [
//         {
//             nums: 
//             sales:
//         },
//         {
//             nums:
//             sales:
//         }
//         ...objects as many as the number of items
//     ]
// }
function setCumulative (vueInstance, sales) {
    sales.push({
        time: Date.now(),
        item_id: 0,
        num: 0,
        price: 0
    });
    let numOfItems = vueInstance.productNames.length;
    let cumulative = []
    let currentobj = initCurrentobj(sales[0], numOfItems);
    let pack = (gap, event) => {
        if (gap === 0) {
            let {item_id ,num, price} = event;
            currentobj.data[item_id].nums += num;
            currentobj.data[item_id].sales += num*price;
        } else {
            cumulative.push(JSON.parse(JSON.stringify(currentobj)));
            currentobj.time += 60000;
            update_pushCurrentObj(gap - 1, event);
        }
    }
    for (let event of sales.slice(1)) {
        let {is_uriko, num, price, user_id} = event;
        if (is_uriko) {
            vueInstance.users[user_id].sales += num*price;
        }
        let gap = gapOfMinutues(event.time, currentobj.time);
        pack(gap, event);
    }
    cumulative.push(JSON.parse(JSON.stringify(currentobj)));
    vueInstance.cumulative = cumulative;
}
function setProductDetails (vueInstance) {
    vueInstance.productDetails = [];
    let lastData = vueInstance.cumulative[vueInstance.cumulative.length - 1].data;
    for (let i = 0; i < lastData.length; i++) {
        vueInstance.productDetails.push({
            id: i,
            sales: lastData[i].sales,
            nums: lastData[i].nums
        });
    }
    vueInstance.productDetails.push({
        id: lastData.length,
        sales: putTogether(lastData, 'sales'),
        nums: putTogether(lastData, 'nums'),
    });
}
function setUserRanking (vueInstance) {
    let extraction = [];
    for (let key in vueInstance.users) {
        extraction.push([key, vueInstance.users[key].sales ]);
    }
    extraction.sort((x, y) => {
        return (x[1] >= y[1]) ? -1 : 1
    })
    vueInstance.userRanking = extraction.map(value => {
        return value[0];
    })
}


// makeGraphData makes data for the graph from the caumulative, which is return-value of setCumulative.
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
function initlizeGraphObj(l, d, name, colors) {
    let graphObj = {
        type: 'line',
        data: {
            labels: l,
            datasets: [
                {
                    label: name,
                    pointRadius: 0,
                    data: d,
                    borderWidth: 3,
                    backgroundColor: colors[0],
                    borderColor: colors[1],
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
                        labelString: 'Time'
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Sales'
                    },
                    ticks: {
                        min: 0
                    }
                }]
            },
            tooltips: {
                mode: 'index',
                intersect: false,
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
        borderWidth: 3,
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

function vueInitlizer(unprocessedobj) {
    let {items, users, sales} = unprocessedobj;
    let vueInstance = {};
    setRightNow(vueInstance);
    setUsers(vueInstance, users);
    setProductNames(vueInstance, items);
    vueInstance.productNames.push('ALL');
    setCumulative(vueInstance, sales);
    setProductDetails(vueInstance);
    setUserRanking(vueInstance);
    vueInstance.selectedProductIds = [items.length];
    return vueInstance;
}





var vm = new Vue({
    el: '#app',
    data: {
        // rightNow represents time
        rightNow: '',

        // products ids which is shown in the graph.
        selectedProductIds: [],

        // The index in this arr will be its productId. 'ALL' is the last.
        productNames: [],

// NOTE: colors needs to be set Manually.
        // each element of productColors is composed of [backgroundColor, borderColor]. This is for graph.
        productColors: [["rgba(30, 144, 255, 0.15)", "rgba(0, 128, 255, 1)"], ["rgba(143, 255, 31, 0.15)", "rgba(143, 255, 31, 1)"], ["rgba(255, 31, 143, 0.15)" ,"rgba(255, 31, 143, 1)"]],

        // each element of productDetails is composed of {id, sales, nums}
        productDetails: [],

        // data made by setCumulative.
        cumulative: [],

        // instance of Chart.
        myChart: null,

        // user information
        // {
        //     userId: {
        //         user_name: 
        //         photo:
        //         sales:
        //     },
        //     userId: {
        //         userName:
        //         photo:
        //         sales:
        //     },
        //     ...
        // }
        users: {},

        // user id will be set in deceding order about their sales.
        userRanking: []
    },
    methods: {

        // receives productId and add its graph dataset to myChart.
        addDataSets(productId) {
            let d;
            if (productId === this.productNames.length - 1) {
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
            let {rightNow, selectedProductIds, productNames, productDetails, cumulative, users, userRanking} = vueInitlizer(obj);
            this.rightNow = rightNow;
            this.selectedProductIds = selectedProductIds;
            this.productDetails = productDetails;
            this.productNames = productNames;
            this.cumulative = cumulative;
            this.users = users;
            this.userRanking = userRanking;
            // initlize myChart
            let graphdata = makeGraphData(cumulative, x => {
                return x.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue.sales
                }, 0);
            });
            this.myChart = new Chart(document.getElementById('myChart'), initlizeGraphObj(graphdata[0], graphdata[1], 'ALL', this.productColors[last.data.length]));
        })
        .catch(error => {
            console.error(error);
        });
    }
});

// update every 60 seconds.
setInterval(() => {
    getJson()
    .then(obj => {
        let {rightNow, selectedProductIds, productNames, productDetails, cumulative, users, userRanking} = vueInitlizer(obj);
        vm.rightNow = rightNow;
        vm.rightNow = rightNow;
        vm.selectedProductIds = selectedProductIds;
        vm.productDetails = productDetails;
        vm.productNames = productNames;
        vm.cumulative = cumulative;
        vm.users = users;
        vm.userRanking = userRanking;
        
        let time = new Date(vm.cumulative[vm.cumulative.length - 1].time);
        vm.myChart.data.labels.push(`${time.getHours()}:${time.getMinutes()}`);

        vm.myChart.data.datasets = vm.myChart.data.datasets.map(element => {
            let productId = vm.productNames.indexOf(element.label);
            element.data.push(vm.productDetails[productId].sales);
        });
        vm.myChart.update();
    })
    .catch(error => console.log(error));
}, 60*1000);



