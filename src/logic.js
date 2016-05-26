module.exports = {

    surplus: "this, with, i\'m, about, re, al, uma, than, them, those, get, got, se, th, go, im, part, should, does, did, can, para, because, us, but, da, os, le, your, do, own, no, at, on, be, our, not, from, the, it is, we all, an, by, to, you, use, me, he, she, they, we, how, have, what, it, if, are, to, toman, pero, for, of, and, in, as, am, their, also, that, my, co, http, com, is, so, de, por, un, una, el, es, or, la, mi, les, di, des, que, en, je, et, ser, soy, los, all, con, follow, las, te, lo, il, des, don, na, del, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o ,p, q, r, s, t, u, v, w, x, y, z, https, http",

    countWordOccurance: function (text) {
        // Remove punctuations, non-word characters...
        //note: this case also remove Vietnamese unicode characters, improve later when needed
        text = text.replace(/[^A-Za-z0-9_\-\s]/g, '');

        var words = text.split(/\s+/),
            wordsObject = {},
            i, il, w;

        for (i = 0, il = words.length; i < il; i++) {
            w = words[i];

            if (wordsObject[w] && typeof (wordsObject[w]) === 'number') {
                wordsObject[w] ++;
            } else {
                wordsObject[w] = 1;
            }
        }

        //tranfer to array in order to sort
        var result = [];
        for (var item in wordsObject) {
            if (wordsObject.hasOwnProperty(item)) {
                //                result.push({ text: item, count:wordsObject[item] });
                if (item != "") {
                    result.push({
                        key: item,
                        value: wordsObject[item]
                    });
                }
            }
        }

        //bigger count stay at top
        result.sort(function (wordA, wordB) {
            return wordB.count - wordA.count;
        });

        return result;
    },

    cleanResponse: function (text, common) {

        var newString = '';

        var wordArr = text.match(/\w+/g),
            commonObj = {},
            uncommonArr = [],
            word, i;

        if (wordArr) {

            common = common.split(',');
            for (i = 0; i < common.length; i++) {
                commonObj[common[i].trim()] = true;
            }

            for (i = 0; i < wordArr.length; i++) {
                word = wordArr[i].trim().toLowerCase();
                if (!commonObj[word]) {
                    newString = newString + ' ' + word;
                }
            }

            newString = newString.replace(/[0-9]/g, '');
        }

        return newString;
    },

    process: function (descriptions) {

        var cleanResponse = this.cleanResponse(descriptions, this.surplus);

        var words = this.countWordOccurance(cleanResponse);

        return words;
    }
}