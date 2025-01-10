CREATE TABLE "galaxy"."analysis_outputs_to_tags" (
	"analysis_output_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "analysis_outputs_to_tags_analysis_output_id_tag_id_pk" PRIMARY KEY("analysis_output_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "galaxy"."analysis_outputs_to_tags" ADD CONSTRAINT "analysis_outputs_to_tags_analysis_output_id_analysis_outputs_id_fk" FOREIGN KEY ("analysis_output_id") REFERENCES "galaxy"."analysis_outputs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galaxy"."analysis_outputs_to_tags" ADD CONSTRAINT "analysis_outputs_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "galaxy"."tags"("id") ON DELETE no action ON UPDATE no action;