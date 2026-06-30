const { collections, admin } = require('../server/lib/firestore.cjs');

const csvData = `word,reading,meaning,level
食べる,たべる,to eat,N5
飲む,のむ,to drink,N5
行く,いく,to go,N5
来る,くる,to come,N5
見る,みる,to see,N5
聞く,きく,to hear,N5
話す,はなす,to speak,N5
読む,よむ,to read,N5
書く,かく,to write,N5
買う,かう,to buy,N5
会う,あう,to meet,N5
ある,ある,to exist (thing),N5
いる,いる,to exist (living),N5
好き,すき,like,N5
嫌い,きらい,dislike,N5
大きい,おおきい,big,N5
小さい,ちいさい,small,N5
新しい,あたらしい,new,N5
古い,ふるい,old,N5
高い,たかい,expensive/tall,N5
安い,やすい,cheap,N5
早い,はやい,early,N5
遅い,おそい,late,N5
良い,いい,good,N5
悪い,わるい,bad,N5
今日,きょう,today,N5
明日,あした,tomorrow,N5
昨日,きのう,yesterday,N5
時間,じかん,time,N5
人,ひと,person,N5
友達,ともだち,friend,N5
先生,せんせい,teacher,N5
学生,がくせい,student,N5
学校,がっこう,school,N5
仕事,しごと,work,N5
家,いえ,house,N5
日本,にほん,japan,N5
英語,えいご,english,N5
水,みず,water,N5
ご飯,ごはん,rice/meal,N5
電車,でんしゃ,train,N5
車,くるま,car,N5
勉強する,べんきょうする,to study,N4
働く,はたらく,to work,N4
使う,つかう,to use,N4
作る,つくる,to make,N4
考える,かんがえる,to think,N4
始める,はじめる,to start,N4
終わる,おわる,to finish,N4
続ける,つづける,to continue,N4
決める,きめる,to decide,N4
助ける,たすける,to help,N4
必要,ひつよう,necessary,N4
大切,たいせつ,important,N4
有名,ゆうめい,famous,N4
便利,べんり,convenient,N4
不便,ふべん,inconvenient,N4
簡単,かんたん,easy,N4
難しい,むずかしい,difficult,N4
忙しい,いそがしい,busy,N4
楽しい,たのしい,fun,N4
嬉しい,うれしい,happy,N4
悲しい,かなしい,sad,N4
強い,つよい,strong,N4
弱い,よわい,weak,N4
近い,ちかい,near,N4
遠い,とおい,far,N4
場所,ばしょ,place,N4
理由,りゆう,reason,N4
問題,もんだい,problem,N4
答え,こたえ,answer,N4
経験,けいけん,experience,N4`;

async function seed() {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  const words = lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i].trim();
    });
    return obj;
  });

  console.log(`Parsed ${words.length} words. Starting batch upload...`);

  const batch = admin.firestore().batch();
  
  words.forEach(word => {
    // We use the word as the ID to avoid duplicates
    const docRef = collections.words.doc(word.word);
    batch.set(docRef, {
      ...word,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });

  try {
    await batch.commit();
    console.log('Successfully seeded words database.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
