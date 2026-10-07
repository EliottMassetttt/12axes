package com.twelveaxes.model;

import java.util.List;

/**
 * @param terms termos do glossário encontrados no texto, em ordem de aparição (nunca nulo)
 */
public record Question(
        String id,
        String axisId,
        String text,
        Pole agreePole,
        double weight,
        List<QuestionTerm> terms
) {
    public Question {
        terms = terms == null ? List.of() : List.copyOf(terms);
    }

    public Question withText(String newText) {
        return new Question(id, axisId, newText, agreePole, weight, terms);
    }

    public Question withTerms(List<QuestionTerm> newTerms) {
        return new Question(id, axisId, text, agreePole, weight, newTerms);
    }
}
