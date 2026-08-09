package com.ecotrack.ai.prompt;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.core.io.Resource;

public abstract class AbstractPromptBuilder<C> {

    protected final Resource systemResource;
    protected final Resource userResource;

    protected AbstractPromptBuilder(Resource systemResource, Resource userResource) {
        this.systemResource = systemResource;
        this.userResource = userResource;
    }

    public Prompt build(C context) {
        String systemText = new PromptTemplate(systemResource).render();
        String userText = new PromptTemplate(userResource).render(toModel(context));
        return new Prompt(java.util.List.of(
                new SystemMessage(systemText),
                new UserMessage(userText)
        ));
    }

    protected abstract java.util.Map<String, Object> toModel(C context);
}
