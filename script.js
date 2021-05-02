var tot_words = 10;
function make_sentence(element){
    wordss = []
    for (let i=0; i<tot_words; i++){
        let word=wordss[i-1];
        while (1){
            word = words[parseInt(Math.random()*words.length)]
            if (word!=wordss[wordss.length-1]) break
        }
        wordss.push(word)
    }
    element.innerHTML = wordss.join` `
}

const doc = document.querySelector('#paragraph')
const chart = document.getElementById('chart')
const input = document.querySelector('#inputarea')
var paragraph;
var text;
var state;
var starting;
var total_written;
var wpms;
var wpmr;
var label;
var myChart;
var last_record;
var timer;
var sec_passed;

function fontChange(id){
    let font = ''
    for (let i of ['#tnr','#hel','#csa']){
        document.querySelector(i).classList.remove('selectedFont')
    }
    if (id=='TNR'){
        font='Times New Roman'
        document.querySelector('#tnr').classList.add('selectedFont')
    }
    else if (id=='Hel'){
        font='Helvetica'
        document.querySelector('#hel').classList.add('selectedFont')
    }
    else if (id='CSa'){
        font="Comic Sans MS"
        document.querySelector('#csa').classList.add('selectedFont')
    }
    document.querySelector('body').style.fontFamily=font
}

function changeWordLength(){
    tot_words = document.querySelector("#nwords").value
}

function reset(){
    if (myChart) myChart.destroy();
    endTimer()
    make_sentence(doc)
    paragraph = doc.innerHTML;
    text = doc.innerHTML.trim().split` `;
    state = false;
    starting = 0;
    total_written = [];
    wpms = [];
    wpmr = [];
    label = [];
    last_record=0;
    input.value = ''
    document.querySelector('#results').style.display = 'none';
    document.querySelector('#time').innerHTML = "00:00"
    input.focus()
    last_record = 0;
    sec_passed = 1;
}
reset()

doc.innerHTML = paragraph;

resize_chart = ()=>{
    if (myChart) myChart.destroy()
    chart.height = 250
    if (window.innerWidth<=500){
        chart.width = 80/100*window.innerWidth
        document.querySelector('#results').style.display = state?'block':'none'
    }
    else {
        chart.width = 80/100*window.innerWidth - 120
        document.querySelector('#results').style.display = state?'flex':'none'
    }
    chartWPM(wpmr, wpms)
}
resize_chart()
window.addEventListener('resize',()=>resize_chart())

function intext(written, text){
    return text.substr(0,written.length)==written;
}

function chartWPM(wpmr, wpm){
    var ctx = chart.getContext('2d');
    if (myChart) myChart.destroy()
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: label,
            datasets: [
                {
                label: 'WPM',
                data: wpm,
                borderColor:'rgba(255, 99, 132, 1)',
                borderWidth: 2
            },
            {
                label: 'WPM per word',
                data: wpmr,
                borderColor:'#333',
                borderWidth: 2
            }]
        },
        options: {
            responsive: false,
            elements:{line:{tension:0.4}},
            hover: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    displayColors: false,
                    callbacks:{
                        title: function(a,b){
                            return total_written[a[0].label-1]
                        }
                    }
                },
            }
        }
    });
}

function colorize(written) {
    let green_half = total_written.join(' ')
    let red_half = ''
    for (let i=0; i<written.length; i++){
        if (written[i]==text[0][i]) green_half+=written[i]
        else {
            red_half = text.join` `.substr(i, written.length-i)
            break
        }
    }
    let white_half = text.join` `.substr(written.length)
    doc.innerHTML = `<span style=color:${'green'};>${green_half}</span><span style=background:red;>${red_half}</span>${white_half}`
}

function startTimer(){
    timer = setInterval(()=>{
        document.querySelector('#time').innerHTML = parseInt(sec_passed/60).toString().padStart(2,0)+":"+parseInt(sec_passed%60).toString().padStart(2,0);
        sec_passed += .01
    },10)
}
function endTimer(){
    clearInterval(timer)
}

function writing(){
    if (!text.length) {
        input.value = ''
        return;
    }
    let written = input.value
    let desired = text[0]+(text.length>1?' ':'');
    let deltaTime = sec_passed
    if (state==false){
        state=true;
        startTimer()
    }
    if (intext(written, desired)){
        if (written==desired){
            total_written.push(desired)
            let currwpm = parseFloat(60*total_written.length/deltaTime).toFixed(2)
            text.splice(0,1)
            input.value = ''
            label.push(total_written.length)
            wpms.push(currwpm)
            wpmr.push(parseFloat(60/(deltaTime-(last_record||starting))).toFixed(2))
            last_record = deltaTime
        }
        input.style.background = 'white';
    }
    else {
        input.style.background = '#d30';
    }
    if (total_written.join``==paragraph){
        endTimer()
        chartWPM(wpmr, wpms)
        let currwpm = parseFloat(60*total_written.length/deltaTime).toFixed(2)
        document.querySelector('#results').style.display = window.innerWidth>=500?'flex':'block'
        document.querySelector('#wpm').innerHTML = currwpm
        document.querySelector('#words').innerHTML = total_written.length
        document.querySelector('#time').innerHTML = 
            parseInt(sec_passed/60).toString().padStart(2,0)+":"+parseFloat(sec_passed%60).toFixed(2).toString().padStart(5,0)
        document.querySelector('#time2').innerHTML = 
            parseInt(sec_passed/60).toString()+":"+parseFloat(sec_passed%60).toFixed(2).toString().padStart(5,0)
    }
    colorize(input.value)
}