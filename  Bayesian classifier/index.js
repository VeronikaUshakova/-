let block = document.getElementById("main_block");

function add(content) {
    let set;
    if(localStorage.getItem(content) === null) {
        set = [];
    } else {
        set = JSON.parse(localStorage.getItem(content));
    }
    let input_set = document.getElementById("input_"+content);
    if(input_set.value.trim() !== "") {
        set.push(input_set.value);
        localStorage.setItem(content, JSON.stringify(set));
    }
    load_content(content);
}

function load_content(content) {
    let main_local="";
    if(content === "spam") {
        main_local = "spam";
    }else{
        main_local = "no_spam";
    }
    if(document.getElementById(main_local) === null) {
        block.innerHTML ="";
        if(localStorage.getItem(main_local) !== null) {
            let set = JSON.parse(localStorage.getItem(main_local));
            for(let  i = 0;i< set.length;i++) {
                let p = document.createElement("p");
                p.innerHTML = (i+1)+". "+set[i];
                block.append(p);
            }
        }
        let row = document.createElement("div");
        row.classList.add("row");
        row.classList.add("p-1");
        block.append(row);
        let input_set= document.createElement("textarea");
        input_set.id = "input_"+content;
        input_set.classList.add("w-100");
        row.append(input_set);
        let button_add = document.createElement("button");
        button_add.innerHTML="Додати до спаму";
        button_add.classList.add("btn");
        button_add.classList.add("btn-outline-success");
        button_add.classList.add("mt-2");
        button_add.setAttribute('onclick', 'add("'+main_local+'")');
        row.append(button_add);
    }
}

function load_mail() {
    block.innerHTML = "";
    let row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("p-1");
    block.append(row);
    let input_mail= document.createElement("textarea");
    input_mail.id = "input_set";
    input_mail.classList.add("w-100");
    row.append(input_mail);
    let button_check = document.createElement("button");
    button_check.innerHTML="Перевірити";
    button_check.classList.add("btn");
    button_check.classList.add("btn-outline-success");
    button_check.classList.add("mt-2");
    button_check.setAttribute('onclick', 'check_mail()');
    row.append(button_check);
}

function check_mail() {
    let set_of_words = [];
    let spam=[];
    let no_spam=[];
    if(localStorage.getItem("spam") === null) {
        spam = [];
    } else {
        spam = JSON.parse(localStorage.getItem("spam"));
    }
    if(localStorage.getItem("no_spam") === null) {
        no_spam = [];
    } else {
        no_spam = JSON.parse(localStorage.getItem("no_spam"));
    }
    for(let i = 0;i< spam.length;i++){
        set_of_words.push(spam[i]);
    }
    for(let i = 0;i< no_spam.length;i++){
        set_of_words.push(no_spam[i]);
    }
    let set_word = [];
    set_word = count_words(set_of_words);
    let set_spam = [];
    set_spam = count_words(spam);
    let set_no_spam = [];
    set_no_spam = count_words(no_spam);
    let words = table_spam_no_spam(set_word, set_spam, set_no_spam);
    let possibility_words = possibility(words);
    let norm_possibility_words = norm_possibility(possibility_words);
    let sentences = [];
    sentences.push(document.getElementById("input_set").value);
    let set_sentences = count_words(sentences);
    let result = check(norm_possibility_words, set_sentences);
    if(result.spam > result.no_spam) {
        alert("Дане повідомлення відноситься до класу спам!");
    } else if(result.spam < result.no_spam) {
        alert("Дане повідомлення не відноситься до класу спам!");
    } else {
        alert("На жаль, неможливо визначити чи відноситься це повідомлення до спаму!");
    }
    console.log(result);
}

function count_words(set_words) {
    let all_string = "";
    for(let i = 0; i < set_words.length; i++) {
        all_string+=set_words[i]+" ";
    }
    let text="";
    let proverka = true;
    let separator = [".",",",":",";","!","1","2","3","4","5","6","7","8","9","0","?","(",")","—","«","»", "–"]
    for(let i = 0;i< all_string.length;i++){
        for(let j = 0;j < separator.length;j++){
            if(all_string[i] === separator[j]) {
                proverka = false;
                break;
            }
        }
        if(proverka !== false) {
            text+=all_string[i];
        } else {
            proverka = true;
        }
    }
    let words = text.split(" ");
    for(let i = 0;i< words.length;i++) {
        if(words[i] === "" || words[i] === "-") {
            words.splice(i,1);
        }
    }
    return amount_words(words);
}

function amount_words(words) {
    let words_one = unique(words);
    return count_one_words(words, words_one)
}

function unique(arr) {
    let result = [];
    for (let str of arr) {
        if (!result.includes(str)) {
            result.push(str);
        }
    }
    return result;
}

function count_one_words(words, words_one) {
    let list_words = [];
    for(let i = 0;i<words_one.length;i++) {
        let word = {};
        word.title = words_one[i];
        word.amount = 0;
        list_words.push(word);
    }
    for(let i = 0;i< list_words.length;i++) {
        for (let j = 0; j < words.length; j++) {
            if(list_words[i].title === words[j]){
                list_words[i].amount++;
            }
        }
    }
    return list_words;
}

function table_spam_no_spam(set_word, set_spam, set_no_spam) {
    let words = [];
    for(let i = 0; i < set_word.length; i++) {
        let word = {};
        word.title = set_word[i].title;
        word.amount_spam = 0;
        word.amount_no_spam = 0;
        words.push(word);
    }
    for(let i = 0; i < words.length; i++) {
        for (let j = 0; j < set_spam.length; j++) {
            if(words[i].title === set_spam[j].title){
                words[i].amount_spam = set_spam[j].amount;
            }
        }
    }
    for(let i = 0; i < words.length; i++) {
        for (let j = 0; j < set_no_spam.length; j++) {
            if(words[i].title === set_no_spam[j].title){
                words[i].amount_no_spam = set_no_spam[j].amount;
            }
        }
    }
    return words;
}

function possibility(set_words) {
    let words = [];
    for(let i = 0;i< set_words.length;i++) {
        let word = {};
        word.title = set_words[i].title;
        word.spam = set_words[i].amount_spam;
        word.no_spam = set_words[i].amount_no_spam;
        let all = word.spam + word.no_spam;
        word.possibility_spam = Number((word.spam / all).toFixed(2));
        word.possibility_no_spam = Number((word.no_spam / all).toFixed(2));
        words.push(word);
    }
    return words;
}

function norm_possibility(possibility_words) {
    let words = [];
    for(let i = 0;i< possibility_words.length;i++) {
        let word = {};
        word.title = possibility_words[i].title;
        word.spam = possibility_words[i].spam;
        word.no_spam = possibility_words[i].no_spam;
        let all = word.spam + word.no_spam;
        word.possibility_spam = Number((word.spam / all).toFixed(2));
        word.possibility_no_spam = Number((word.no_spam / all).toFixed(2));
        word.norm_possibility_spam = Number(((all*word.possibility_spam+0.5)/(all+1)).toFixed(2));
        word.norm_possibility_no_spam = Number(((all*word.possibility_no_spam+0.5)/(all+1)).toFixed(2));
        words.push(word);
    }
    return words;
}

function check(norm_possibility_words, set_sentences) {
    let result = {};
    result.spam = 0.5;
    result.no_spam = 0.5;
    for(let i = 0;i< set_sentences.length;i++) {
        for(let j = 0;j< norm_possibility_words.length;j++){
            if(set_sentences[i].title === norm_possibility_words[j].title) {
                result.spam*=norm_possibility_words[j].norm_possibility_spam;
                result.no_spam*=norm_possibility_words[j].norm_possibility_no_spam;
                break;
            }
        }
    }
    return result;
}

function graph() {
    let set_of_words = [];
    let spam=[];
    let no_spam=[];
    if(localStorage.getItem("spam") === null) {
        spam = [];
    } else {
        spam = JSON.parse(localStorage.getItem("spam"));
    }
    if(localStorage.getItem("no_spam") === null) {
        no_spam = [];
    } else {
        no_spam = JSON.parse(localStorage.getItem("no_spam"));
    }
    for(let i = 0;i< spam.length;i++){
        set_of_words.push(spam[i]);
    }
    for(let i = 0;i< no_spam.length;i++){
        set_of_words.push(no_spam[i]);
    }
    let set_word = [];
    set_word = count_words(set_of_words);
    let set_spam = [];
    set_spam = count_words(spam);
    let set_no_spam = [];
    set_no_spam = count_words(no_spam);
    let words = table_spam_no_spam(set_word, set_spam, set_no_spam);
    let possibility_words = possibility(words);
    let norm_possibility_words = norm_possibility(possibility_words);
    let stat={};
    stat.spam = 0;
    stat.no_spam = 0;
    stat.nothing = 0;
    for(let i = 0; i < norm_possibility_words.length; i++) {
        if (norm_possibility_words[i].norm_possibility_spam > norm_possibility_words[i].norm_possibility_no_spam) {
            stat.spam += 1;
        } else if (norm_possibility_words[i].norm_possibility_spam < norm_possibility_words[i].norm_possibility_no_spam) {
            stat.no_spam += 1;
        } else {
            stat.nothing += 1;
        }
    }
    block.innerHTML="";
    let header = document.createElement("h6");
    header.innerHTML = "<i>Графік залежності проценту коректних класів, визначених за допомогою моделі класифікації, від об’єму вибірки<i>"
    block.prepend(header);
    let canvas = document.createElement("canvas");
    canvas.id = "myChart";
    block.append(canvas);
    canvas = document.getElementById('myChart').getContext('2d');
    let myChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ["Спам", "Не спам", "Невідомо"],
            datasets: [{
                data: [stat.spam, stat.no_spam, stat.nothing],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}