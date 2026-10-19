import "./HomePage.css";
import { useRef } from "react";
import { useEncounter } from "../hooks/useEncounter";
import { useTypeTheme } from "../hooks/useTypeTheme";
import { BattleMenu } from "../components/BattleMenu";
import { FailureMessage } from "../components/FailureMessage";
import { Stage } from "../components/Stage";
import { StageSkeleton } from "../components/StageSkeleton";
import { MessageBox } from "../ui/MessageBox";
import { StageConsole } from "../ui/StageConsole";
import { encounterMessage, LOADING_LABEL, MENU_PROMPT } from "../lib/copy";

export function HomePage() {
  const { id, data, loading, error, retry } = useEncounter();
  const stageRef = useRef<HTMLDivElement>(null);

  //the wild pokemon paints the page in its type colors same way
  //pokemon page does. while loading or after a failure there is no theme
  useTypeTheme(error ? undefined : data?.types.map((t) => t.type.name));

  //retry removes its own button so move focus to the stage slot first
  //(same reasoning as PokemonPage.handleRetry)
  function handleRetry() {
    stageRef.current?.focus();
    retry();
  }

  //exactly one situation at a time, the menu below is the same in all of them:
  //home must stay usable when the encounter cannot load
  let stage;
  let message;
  if (error) {
    stage = (
      <FailureMessage kind={error} query={String(id)} onRetry={handleRetry} />
    );
    message = MENU_PROMPT;
  } else if (loading || !data) {
    stage = <StageSkeleton />;
    message = LOADING_LABEL;
  } else {
    stage = <Stage pokemon={data} shiny={false} />;
    message = encounterMessage(data.name);
  }

  return (
    <StageConsole
      stage={
        <div className="home-stage" ref={stageRef} tabIndex={-1}>
          {stage}
        </div>
      }
    >
      <div className="home-console">
        <MessageBox text={message} />
        <BattleMenu />
      </div>
    </StageConsole>
  );
}
