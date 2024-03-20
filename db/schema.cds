namespace com.mindset.quiz;
using { managed, cuid } from '@sap/cds/common';

entity quiz : managed, cuid {
    key ID: UUID;
    title: String;
    endTime: Time;
    date: Date;
    noOfQues: Integer;
    fullMarks: Integer;
    passMarks: Integer;
    learningSP: Date;
    learningEP: Date;
    questions: array of {
        content: String;
        score: Integer;
        noOfOptions: Integer;
        options: array of {
            option: String;
            correctOption: Boolean;
        };
    };
    draft: Boolean;
}