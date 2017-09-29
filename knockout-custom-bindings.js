/*!
    exemplo de como criar um componente knockout
    ko.bindingHandlers.yourBindingName = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
        }
    };
*/

/*
    AUTOCOMPLETE
        MODO DE USO:
            <input 
                type="text"
                data-bind="
                    autocomplete:<o ko.obervable do objeto que irá receber o valor>,
                    source:'<a url do controller para onde a chamada deve ser direcionada>',
                    render: <opcional, callback que monta as opções do autocomplete quando o retono não é chave=>valor>
                    onselect: <opcional, callback com a ação de onselect do input
                "
            />
        EXEMPLO DE RENDER:
        self.renderRule = function(data)
        {
            if(data != null && data.status != undefined)
            {
                if(data.status == 1)
                {
                    var options = [];
                    ko.utils.arrayForEach(data.response, function(i)
                    {
                        options.push(i.usu_id_ambev+' - '+i.usu_nome);
                    });
                    return options;
                }
                else
                {
                   alertModal.show('Erro ao buscar dados no Portal Click');
                }
            }
            else
            {
                alertModal.show('Erro ao processar dos dados contate o Administrador do sistema.');
            }
        };
*/
ko.bindingHandlers.autocomplete = {
    init: function(element, valueAccessor, allBindings) {
        var value = valueAccessor();
        var urlSource = allBindings.get('source');
        var render = allBindings.get('render');
        var onselect = allBindings.get('onselect');
        var opcoes = allBindings.get('opcoes');

        //  atribuindo automaticamente um loading para sinalizar o carregamento
        $(element).parent().append("<img class='loading-gif-ui-autocomplete'src='"+GLOBAL_PATH_LOADING_GIF_KNOCKOUT+"' style='display:none;width: 15px;position: relative;float: right;top: -25px;left: -15px;'>");

        $(element).autocomplete(
        {
            source: function(request, response)
            {
            	if(opcoes)
            	{
            		var filtrados = opcoes;
            		if(request.term.length > 0)
            		{
            			filtrados = ko.utils.arrayFilter(opcoes,function(i)
            			{
            				return i.toString().toLowerCase().indexOf(request.term.toString().toLowerCase()) != -1;
            			});
            		}
            		response(filtrados);
            	}
            	else
            	{
                	$(element).parent().find('img.loading-gif-ui-autocomplete').show();
	                $.post(urlSource, {'term':request.term})
	                    .done(function(data)
	                    {
	                        // por problemas de exibição nos modais. trazer o z-indez da lista para frente sempre
	                        $(".ui-autocomplete").css('z-index', '999999');
	                        var dados = JSON.parse(data);
	                        // para customizar a renderização dos dados como concatenação de id - nome fazer um callback que receba os dados e formate em array
	                        if(render != null)
	                        {
	                            response(render(dados));
	                        }
	                        // senão trazer os dados formatados em array direto do service
	                        else
	                        {
	                            response(dados);
	                        }
	                    }).fail(function(error)
	                    {
	                        console.log('Um erro ocorreu no componente de autocomplete.');
	                        console.log(error);
	                    }).always(function()
	                    {
	                        $(element).parent().find('img.loading-gif-ui-autocomplete').hide();
	                    });
            	}
            },
            minlength: 3, 
            select: function(event, ui)
            {
                // sempre que selecionado o valor do input recebe a string no observable... para fazer uma pos exexução setar o callback onselect
                valueAccessor()(ui.item.value);
                if(onselect != null)
                {
                    onselect(event, ui);
                }
            }
        });
        ko.utils.registerEventHandler(element, 'focusout', function() {
            var observable = valueAccessor();
            observable($(element).val());
        });
    },
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).val(value);
    }
};

/*
    DATEPICKER2
        MODO DE USO:
            <input 
                type="text"
                data-bind="
                	value: <ko.obervable do objeto>,    
                    datepicker2: <ko.obervable do objeto>,
                    datepickerOptions: {
                        callbackOk         :<opcional callback com a ação do onselect do calendário>,
                        format             :<opcional string 'yy-mm-dd' ou qualquer outra para o retono da data selecionada no observable>,
                        showDays           :<opcional flag para mostrar ou não os dias no calendário>,
                        showMonths         :<opcional flag para mostrar ou não os meses no calendário>,
                        showYears          :<opcional flag para mostrar ou não o ano no calendário>,
                        showIconsNavigation:<opcional flag para mostrar ou não os botoes de navegação do calendário>,
                    }
                    //TODAS ESSAS OPÇÕES PODEM ESTAR DENTRO DE UM UNICO OBJETO  SIMPLIFICANDO A CONFIGURAÇÃO
                    datepickerOptions:<objeto contendo as opções>
                "
            />
*/
ko.bindingHandlers.datepicker2 = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var options = allBindingsAccessor().datepickerOptions || {};

        // valores defaul
        options.dayNames            = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
        options.dayNamesMin         = ['D','S','T','Q','Q','S','S','D'];
        options.dayNamesShort       = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
        options.monthNames          = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        options.monthNamesShort     = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        options.nextText            = 'Próximo';
        options.prevText            = 'Anterior';
        options.closeText           = 'ok';
        options.changeMonth         = true;
        options.changeYear          = true;
        options.showButtonPanel     = true;
        options.dateFormat          = 'dd/mm/yy';
        options.format              = options.format != undefined ? options.format : 'dd/mm/yy';
        options.showDays            = options.showDays != undefined ? options.showDays : true;
        options.showMonths          = options.showMonths != undefined ? options.showMonths : true;
        options.showYears           = options.showYears != undefined ? options.showYears : true;
        options.showIconsNavigation = options.showIconsNavigation != undefined ? options.showIconsNavigation : true;
        
        options.onClose = function(dateText, inst){
            var data = $.datepicker.formatDate(options.format, new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay),12);
            valueAccessor()(data);
            $(element).val(data);
            if(options.callbackOk != undefined && typeof(options.callbackOk) == 'function')
            {
            	options.callbackOk();
            }
        };
        
        $(element).val(ko.utils.unwrapObservable(valueAccessor()));
        $(element).datepicker(options);
        
        //setando valores default para o datepicker independente da configuração de idioma
        $.datepicker.setDefaults(options);
        
        $(element).focus(function(){
            if (!options.showDays) $(".ui-datepicker-calendar").hide();
            if (!options.showMonths) $(".ui-datepicker-month").hide();
            if (!options.showYears) $(".ui-datepicker-year").hide();
            if (!options.showIconsNavigation) $("div.ui-datepicker-header a.ui-datepicker-prev,div.ui-datepicker-header a.ui-datepicker-next").hide();
        });

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($.datepicker.formatDate(options.format, $(element).datepicker("getDate")));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).datepicker("destroy");
        });

    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        $(element).val(ko.utils.unwrapObservable(valueAccessor()));
    }
};

ko.bindingHandlers.datepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var options = allBindingsAccessor().datepickerOptions || {};

        // valores defaul
        options.dayNames = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
        options.dayNamesMin = ['D','S','T','Q','Q','S','S','D'];
        options.dayNamesShort = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
        options.monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        options.monthNamesShort = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        options.nextText = 'Próximo';
        options.prevText = 'Anterior';
        options.closeText = 'ok';

        $(element).datepicker(options);

        $(".txtDataFiltro").focus(function(){
            if (!options.showDays)
                $(".ui-datepicker-calendar").hide();

            if (!options.showMonths)
                $(".ui-datepicker-month").hide();

            if (!options.showYears)
                $(".ui-datepicker-year").hide();
            
            if (!options.showIconsNavigation)
                $("div.ui-datepicker-header a.ui-datepicker-prev,div.ui-datepicker-header a.ui-datepicker-next").hide();
        });

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($(element).datepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).datepicker("destroy");
        });

    }
};

/*
    NUMERICO
        MODO DE USO:
            <input 
                type="text"
                data-bind="
                    numerico:<ko.observable do objeto>,
                    precisao:'<opcional, padrão 0. numero de casas decimais para exibição>'
                "
            />
        OBS: por mais que a exibição mostre o numero formatado no padrão pt-BR o numero continua do tipo float no observable ;)
*/
ko.bindingHandlers.numerico = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var precisao = allBindings.get('precisao')||0;
        var sobrescrever = allBindings.get('sobrescrever')||true;

        var valor = ko.utils.unwrapObservable(valueAccessor());
        var checker = typeof(valor) == 'string';
        
        valor = valor == null || isNaN(valor) ? 0 : valor;
        valor = parseFloat(parseFloat(valor.toString()).toFixed(precisao));
        element.style.textAlign = 'right';
        
        if(element.tagName == 'INPUT')
        {
            element.value = valor.toLocaleString("pt-BR", { minimumFractionDigits: precisao, maximumFractionDigits: precisao });
            // definindo handlers para forçar o cursor permanecer a direita do input
            ko.utils.registerEventHandler(element, 'click', function(){
                setTimeout((function(element) {
                    var strLength = element.value.length;
                    return function() {
                        if(element.setSelectionRange !== undefined) {
                            element.setSelectionRange(strLength, strLength);
                        } else {
                            element.value = element.value;
                        }
                    }}(this)), 5);
            });
            ko.utils.registerEventHandler(element, 'focus', function(){
                setTimeout((function(element) {
                    var strLength = element.value.length;
                    return function() {
                        if(element.setSelectionRange !== undefined) {
                            element.setSelectionRange(strLength, strLength);
                        } else {
                            element.value = element.value;
                        }
                    }}(this)), 5);
            });
            // =======================================================================
            ko.utils.registerEventHandler(element, 'input', function()
            {
                var valor = element.value.replace(/\D/g,'');
                // ajuste de bug. quando o tamanho do munero é menor que a precisão, estava mudando o valor do input.
                // para solucionar, coloquei esse 'pad' para artificialmente aumentar o tamanho da strig com zeros a esquerda e 
                // o parseFloat elimine os zeros desnecessários e
                var pad = '00000000000000000';

                if(valor == null || valor == '')
                {
                    valor = '0';
                }

                if(precisao > 0)
                {
                    if(valor.length < precisao)
                    {
                        valor = pad + valor;
                    }
                    valor = parseFloat(valor.substr(0, valor.length - precisao) + '.' + valor.substr(valor.length - precisao, valor.length));
                }
                else
                {
                    valor = parseFloat(parseFloat(valor).toFixed(precisao));
                }
                
                element.value = valor.toLocaleString("pt-BR", { minimumFractionDigits: precisao, maximumFractionDigits: precisao }); 
                
                if(ko.isWriteableObservable(valueAccessor()))
                {
                    valueAccessor()(valor);
                }
            });
        }
        else
        {
            element.innerHTML = valor.toLocaleString("pt-BR", { minimumFractionDigits: precisao, maximumFractionDigits: precisao }); 
        }
        
        if(ko.isWriteableObservable(valueAccessor()) && checker && sobrescrever === true)
        {
            valueAccessor()(valor);
        }
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var precisao = allBindings.get('precisao')||0;
        var sobrescrever = allBindings.get('sobrescrever')||true;
        var valor = ko.utils.unwrapObservable(valueAccessor());
        var checker = typeof(valor) == 'string';
        
        valor = valor == null ? 0 : valor;
        valor = typeof(valor) == 'string' && valor.indexOf(",") != -1 ? valor.replace(/\./g,'').replace(",",".") : valor;
        valor = parseFloat(valor).toFixed(precisao);
        valor = isNaN(valor) ? valor.toString().replace(/\D/g,'') : valor;
        
        if(valor == null || valor == '')
        {
            valor = 0;
        }
        
        valor = parseFloat(valor);
        
        if(element.tagName == 'INPUT')
        {
            element.value = valor.toLocaleString("pt-BR", { minimumFractionDigits: precisao, maximumFractionDigits: precisao }); 
        }
        else
        {
            element.innerHTML = valor.toLocaleString("pt-BR", { minimumFractionDigits: precisao, maximumFractionDigits: precisao }); 
        }
        
        if(ko.isWriteableObservable(valueAccessor()) && checker && sobrescrever === true)
        {
            valueAccessor()(valor);
        }
    }
};

/*
    FADEVISIBLE
        MODO DE USO:
            FERRAMENTA PARA FAZER ITENS ESPANCÍVEIS COM FLAG BOOLEANA
            <div data-bind="fadeVisible: <ko.observable do objeto contendo booleano true/false>">
*/
ko.bindingHandlers.fadeVisible = {
	init: function(element, valueAccessor) {
	    // Initially set the element to be instantly visible/hidden depending on the value
	    var value = valueAccessor();
	    $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
	},
	update: function(element, valueAccessor) {
	    // Whenever the value subsequently changes, slowly fade the element in or out
	    var value = valueAccessor();
	    // ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
        ko.unwrap(value) ? $(element).slideDown('slow') : $(element).slideUp('slow');
	}
}; 

ko.bindingHandlers.selectableMultiple = {
    init: function(element, valueAccessor) { 
        $('.selectable').on("selectableselected", function(event, ui){
           if(ui.selected === element) {
                var valor = valueAccessor();
                valor(true);
            }
        });
        $('.selectable').on("selectableunselected", function(event, ui){
            if(ui.unselected === element) {
                var valor = valueAccessor();
                valor(false);
            }
        });
    } 
};

ko.bindingHandlers.multiDatesPicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var options = allBindingsAccessor().datepickerOptions || {};

        // valores defaul
        options.dayNames = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
        options.dayNamesMin = ['D','S','T','Q','Q','S','S','D'];
        options.dayNamesShort = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
        options.monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        options.monthNamesShort = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        options.nextText = 'Próximo';
        options.prevText = 'Anterior';
        options.dateFormat = 'dd/mm/yy';
        options.closeText = 'ok';

        $(element).multiDatesPicker(options);
        $(".botaoReplicar").click(function(){
            $(".ui-datepicker-calendar").show();
            $(".ui-datepicker-month").show();
            $(".ui-datepicker-year").show();
            $("div.ui-datepicker-header a.ui-datepicker-prev,div.ui-datepicker-header a.ui-datepicker-next").show();
        });

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($(element).datepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).datepicker("destroy");
        });
    
    }
};

/*
    MULTIDATESPICKER2
        MODO DE USO:
            <div
                id="datepicker-inline"
                data-bind="
                    multiDatesPicker : <ko.observableArray do objeto que irá receber a coleção de datas selecionadas>, 
                    datepickerOptions: {
                        beforeShowDay: true
                    }">
                
            </div>
*/
ko.bindingHandlers.multiDatesPicker2 = {
    init: function (element, valueAccessor, allBindingsAccessor) {
    	var observable = valueAccessor();
        var options = allBindingsAccessor().datepickerOptions || {};

        // valores defaul
        options.dayNames = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
        options.dayNamesMin = ['D','S','T','Q','Q','S','S','D'];
        options.dayNamesShort = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
        options.monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        options.monthNamesShort = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        options.nextText = 'Próximo';
        options.prevText = 'Anterior';
        options.closeText = 'ok';
        options.dateFormat = 'yy-mm-dd';
        options.onSelect = function(a,b,c,d)
        {
        	observable($(element).multiDatesPicker('getDates'));
        }
        
        // desabilita datas do passado
        options.beforeShowDay = options.beforeShowDay == true ? function(date){
            var string = jQuery.datepicker.formatDate('yy-mm-dd', date);
            var now    = jQuery.datepicker.formatDate('yy-mm-dd', new Date());
            return [ string >= now ]
        } : options.beforeShowDay;
        
        $(element).multiDatesPicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            
            observable($(element).datepicker("getDates"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).datepicker("destroy");
        });
    }
};


/*
    TOOLTIP
        MODO DE USO:
            <span
                class="rotated-text__inner"
                data-tooltip
                data-bind="
                    text: <ko.observable do objeto com a string do tolltip>, 
                    attr: {id: <ko.observable do objeto com a string do tolltip>}, 
                    tooltip: <ko.observable do objeto com a string do tolltip>
                "></span>
*/
ko.bindingHandlers.tooltip = {
    update: function(element, valueAccessor) {
        
        $(element).foundation({
            tooltip: {
              selector : '.has-tip',
              additional_inheritable_classes : [],
              tooltip_class : '.tooltip',
              touch_close_text: 'tap to close',
              disable_for_touch: false,
              tip_template : function (selector, content) {
                return '<span data-selector="' + selector + '" class="'
                  + Foundation.libs.tooltip.settings.tooltip_class.substring(1)
                  + '">'+ko.unwrap(valueAccessor())+'<span class="nub"></span></span>';
              }
            }
          });
    }
};

/*
    GAUGE
        MODO DE USO:
            <canvas width="230" height="230" style="margin-bottom:12px;" data-bind="gauge:heat"></canvas>
        OBS: o objeto deve conter os nomes reservados[
            meta
            real
            tendencia
            descricao
        ]
*/
ko.bindingHandlers.gauge = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var c = element;
        var ctx = c.getContext("2d");
        ctx.beginPath();
        //aplicando o titulo do objeto
        ctx.font = '20px Arial';

        ctx.fillText(valueAccessor()().descricao(), 120, 170);
        ctx.stroke();
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext)
    {
    	var
    	//resgatando os valores de meta, real e tendencia do objeto
	    	t1        = valueAccessor()().meta()      == ' - ' ? 0 : parseFloat(valueAccessor()().meta()).toFixed(2),
	    	t2        = valueAccessor()().real()      == ' - ' ? 0 : parseFloat(valueAccessor()().real()).toFixed(2),
	    	t3        = valueAccessor()().tendencia() == ' - ' ? 0 : parseFloat(valueAccessor()().tendencia()).toFixed(2),
	    	META      = parseFloat(t1),
	    	REAL      = parseFloat(t2),
	    	TENDENCIA = parseFloat(t3),
    	//definição das cores do gauge
    		fundo    = "#d9e1e3",
    		meta     = "#818387",
    		verde    = "#73aa22",
    		vermelho = "#fe4b4e",
        //elementos de calculos de perimetro
			PI = Math.PI,
			PI2 = PI * 2,
			min = PI * .50,
			max = PI,
        //transformando o perimetro em porcentagem
        	percentualMeta      = META > 0 ? -50 : 0, // o percentual de meta sempre será a metade do medidor se o valor for diferente de zero
        	fatorGauge          = META * 2 / 100;
        	maximoGauge = -100;
        	percentualReal      = (REAL / fatorGauge) * -1 < maximoGauge ? maximoGauge : (REAL / fatorGauge) * -1;
        	percentualTendencia = (TENDENCIA / fatorGauge) * -1 < maximoGauge ? maximoGauge : (TENDENCIA / fatorGauge) * -1;
        //definindo as cores de real e tendencia
        	corReal      = META >= REAL ? verde : vermelho,
        	corTendencia = META >= TENDENCIA ? verde : vermelho,
        //inicio da manipulação da canvas
        	cx = element.width / 2,
        	cy = element.height / 2,
        	ctx = element.getContext("2d")
        ;
        //limpando a canvas antes de iniciar
			ctx.clearRect(0, 0, element.width, element.height);
        //aplicando o titulo do objeto
	        ctx.beginPath();
	        ctx.textAlign = 'center';
	        ctx.textBaseline = 'middle';
	        ctx.font = '20px Arial';
	        ctx.fillStyle = '#818387';
	        ctx.fillText(valueAccessor()().descricao().toUpperCase(), cx, cy);
	        ctx.stroke();
        /*=========================================================
         PRIMEIRO ARCO -> META
         =========================================================*/
        //FUNDO
	        ctx.beginPath();
	        ctx.arc(cx, cy, 60, min, max, true);
	        ctx.strokeStyle = fundo;
	        ctx.lineWidth = 10;
	        ctx.stroke();
        //PINTADO
	        ctx.beginPath();
	        ctx.arc(cx, cy, 60, min, min+(PI2-min)*percentualMeta/100, true);
	        ctx.strokeStyle = meta;
	        ctx.lineWidth = 10;
	        ctx.stroke();
        //TEXTO
	        ctx.beginPath();
	        ctx.textAlign = 'end';
	        ctx.textBaseline = 'middle';
	        ctx.font = '10px Arial';
	        ctx.fillText('Meta: ' + ((valueAccessor()().meta() == ' - ') ? valueAccessor()().meta() : META.toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2})) , cx - 9, cy + 60);
	        ctx.stroke();
        /*=========================================================
         SEGUNDO ARCO -> REAL
         =========================================================*/
        //FUNDO
	        ctx.beginPath();
	        ctx.arc(cx, cy, 75, min, max, true);
	        ctx.strokeStyle = fundo;
	        ctx.lineWidth = 10;
	        ctx.stroke();
        //PINTADO
	        ctx.beginPath();
	        ctx.arc(cx, cy, 75, min, min+(PI2-min)*percentualReal/100 , true);
	        ctx.strokeStyle = corReal;
	        ctx.lineWidth = 10;
	        ctx.stroke();
        //TEXTO
	        ctx.beginPath();
	        ctx.textAlign = 'end';
	        ctx.textBaseline = 'middle';
	        ctx.font = '10px Arial';
	        ctx.fillText('Real: ' + ((valueAccessor()().real() == ' - ') ? valueAccessor()().real() : REAL.toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2})), cx - 9, cy + 75);
	        ctx.stroke();
        /*=========================================================
         TERCEIRO ARCO -> TENDENCIA
         =========================================================*/
        //FUNDO
	        ctx.beginPath();
	        ctx.arc(cx, cy, 90, min, max, true);
	        ctx.strokeStyle = fundo;
	        ctx.lineWidth = 10;
	        ctx.stroke();
        //PINTADO
	        ctx.beginPath();
	        ctx.arc(cx, cy, 90, min, min+(PI2-min)*percentualTendencia/100 , true);
	        ctx.strokeStyle = corTendencia;
	        ctx.lineWidth = 10;
	        ctx.stroke();
        //TEXTO
	        ctx.beginPath();
	        ctx.textAlign = 'end';
	        ctx.textBaseline = 'middle';
	        ctx.font = '10px Arial';
	        ctx.fillText('Tendendia: ' + ((valueAccessor()().tendencia() == ' - ') ? valueAccessor()().tendencia() : TENDENCIA.toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2})), cx - 9, cy + 90);
	        ctx.stroke();
    }
};

ko.bindingHandlers.propValue = {
    init: function(element, valueAcessor) {
        
        var valor = valueAcessor;
        $(element).click(function() {
            valor()(!valor()())
        })
    }
};

/*
    MASKED
        MODO DE USO:
            <input 
                type="text"
                data-bind="
                    masked:<ko.observable do objeto>
                    pattern:'<obrigatório string com o pattern desejado ex: (99) 9999-9999?9>'
                "
            />
*/
ko.bindingHandlers.masked = {
    init: function(element, valueAccessor, allBindings){
        var pattern = allBindings.get('pattern');
        $(element).mask(pattern);
        ko.utils.registerEventHandler(element, 'focusout', function() {
            var observable = valueAccessor();
            observable($(element).val());
        });

    },
    update: function(element, valueAccessor){
         var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).val(value);
    }
};

ko.bindingHandlers.barChart = {
    init: function (element, valueAccessor, allBindings)
    {
		if(element.width == 0) element.width=936;
    	if(element.height == 0) element.height=530;
        var context = element.getContext('2d');
        var opcoes = allBindings.get('opcoes');
        var data_conf = allBindings.get('dados');
        context.clearRect(0, 0, element.width, element.height);
        screenBarChart = new Chart(context, {
            type: 'bar',
            data: data_conf||{
                labels: [],
                datasets: [
                    {
                        data: [],
                        backgroundColor: [],
                        backgroundColor: [],
                        borderWidth: 1,
                    }
                ]
            },
            options: opcoes||{
                legend: {
                    display: false,
                }
            }
        });
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext)
    {
    	var dados = ko.utils.unwrapObservable(valueAccessor());
    	var transformaemimagem = allBindings.get('transformaemimagem');
    	var destruir = allBindings.get('destruir')||false;
		var opcoes = allBindings.get('opcoes');
        var data_conf = allBindings.get('dados');
        var render = allBindings.get('render');

    	if(destruir)
    	{
    		screenBarChart.destroy();	
	    	if(element.width == 0) element.width=936;
	    	if(element.height == 0) element.height=530;
	        var context = element.getContext('2d');
	        context.clearRect(0, 0, element.width, element.height);
	        screenBarChart = new Chart(context, {
	            type: 'bar',
	            data: data_conf||{
	                labels: [],
	                datasets: [
	                    {
	                        data: [],
	                        backgroundColor: [],
	                        backgroundColor: [],
	                        borderWidth: 1,
	                    }
	                ]
	            },
	            options: opcoes|| {
	                legend: {
	                    display: false,
	                }
	            }
	        });
    		
    	}
    	if(typeof(render) == 'function')
    	{
    		render(screenBarChart);
    	}
    	else
    	{
	    	screenBarChart.data.labels = ko.utils.arrayMap(dados, function(i){return i.label});
			screenBarChart.data.datasets[0].data = ko.utils.arrayMap(dados, function(i){return i.value});
			screenBarChart.data.datasets[0].backgroundColor = ko.utils.arrayMap(dados, function(i){return i.color});
    	}
    	screenBarChart.update();
    	
    	if(transformaemimagem != null)
    	{
    		setTimeout(function()
    		{
    			transformaemimagem(element.toDataURL("image/png"));
    		},250);
    	}
    }
};

// classe padrão para o binding knockout relogio
function Relogio()
{
    var self = this;
    self.data = ko.observable();
    self.hora = ko.observable();
}
ko.bindingHandlers.relogio = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        //value acessor deve ser um objeto com as propriedades, {data, hora}
        var objeto = ko.utils.unwrapObservable(valueAccessor());

        var agora = new Date();
        var tmp = {};
        tmp.dia = agora.getDate();
        tmp.mes = agora.getMonth();
        tmp.ano = agora.getFullYear();
        tmp.hor = agora.getHours();
        tmp.min = agora.getMinutes();
        tmp.sem = agora.getDay();
        tmp.pad = function(s, n) {
        s = '0000' + s;
        return (s.substring(s.length - n, s.length));

        }
        tmp.NomeSem = function() {
            var aDia = ['Domingo', 'Segunda Feira', 'Terça Feira', 'Quarta Feira', 'Quinta Feira', 'Sexta Feira', 'Sábado'];
            return aDia[tmp.sem];
        }
        tmp.NomeMes = function() {
            var aMes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            return aMes[tmp.mes];
        }
        objeto.data(tmp.NomeSem() + ', ' + tmp.dia + ' de ' + tmp.NomeMes() + ' de ' + tmp.pad(tmp.ano, 4));
        objeto.hora(tmp.pad(tmp.hor, 2) + ':' + tmp.pad(tmp.min, 2));

        // função responsavel por atualizar o horario na div no handler setInterval
        function updateClock ( )
        {
          var currentTime = new Date ( );

          var currentHours = currentTime.getHours ( );
          var currentMinutes = currentTime.getMinutes ( );
          var currentSeconds = currentTime.getSeconds ( );

          // Pad the minutes and seconds with leading zeros, if required
          currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
          currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;

          // Choose either "AM" or "PM" as appropriate
          var timeOfDay = ( currentHours < 24 ) ? "" : "";

          // Convert the hours component to 12-hour format if needed
          currentHours = ( currentHours > 24 ) ? currentHours - 12 : currentHours;

          // Convert an hours component of "0" to "12"
          currentHours = ( currentHours == 0 ) ? 24 : currentHours;

          // Compose the string for display
          var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds + " " + timeOfDay;

          // Update the time display
          objeto.hora(currentTimeString);
        }

        setInterval(updateClock, 1000 );
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.
    }
};


/*
        font: http://stackoverflow.com/questions/15775608/using-nicedit-with-knockout
        And how to use it:

        <textarea id="area1" data-bind="nicedit: title" style="width: 640px"></textarea>
        ... where in my example "title" is your bound property of course.

        There are two "limitations":

        The textarea must have a DOM "id" attribute otherwise it crashes.
        With IE (at least, version 8) the DOMNodeInserted and DOMNodeRemoved 
        are not fired, which means that you have to type something after 
        modifying the style of your text for it to be properly updated in 
        your observable object.
*/
ko.bindingHandlers.nicedit = {
    init: function(element, valueAccessor) {
        var value = valueAccessor();
        var area = new nicEditor({fullPanel : true}).panelInstance(element, {hasPanel : true});
        // $(element).text(ko.utils.unwrapObservable(value)); 

        // function for updating the right element whenever something changes
        var textAreaContentElement = $($(element).prev()[0].childNodes[0]);
        var areachangefc = function() {
            value(textAreaContentElement.html());
        };
        //setando dados na inicializaÃ§Ã£o
        textAreaContentElement.html(value());

        // Make sure we update on both a text change, and when some HTML has been added/removed
        // (like for example a text being set to "bold")
        $(element).prev().keyup(areachangefc);
        $(element).prev().bind('DOMNodeInserted DOMNodeRemoved', areachangefc);
    },
    update: function(element, valueAccessor) {
        //o update buga o esquema. migrado para o init function que ja tem o keyup e DOMNodeInserted, DOMNodeRemoved function
        /*var value = valueAccessor();
        var textAreaContentElement = $($(element).prev()[0].childNodes[0]);
        textAreaContentElement.html(value());*/
    }
};

ko.bindingHandlers.sortable = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
        var 
            list = valueAccessor(),
            defaultAction = function(){},
            actionActivate   = allBindings.get('activate')   || defaultAction,
            actionBeforeStop = allBindings.get('beforeStop') || defaultAction,
            actionChange     = allBindings.get('change')     || defaultAction,
            actionCreate     = allBindings.get('create')     || defaultAction,
            actionDeactivate = allBindings.get('deactivate') || defaultAction,
            actionOut        = allBindings.get('out')        || defaultAction,
            actionOver       = allBindings.get('over')       || defaultAction,
            actionReceive    = allBindings.get('receive')    || defaultAction,
            actionRemove     = allBindings.get('remove')     || defaultAction,
            actionSort       = allBindings.get('sort')       || defaultAction,
            actionStart      = allBindings.get('start')      || defaultAction,
            actionStop       = allBindings.get('stop')       || defaultAction
            //update           = allBindings.get('update')     || defaultAction,
        ;
        $(element).sortable(
        {
            // containment: 'parent',
            // placeholder: 'placeholder',
            update: function (event, ui)
            {
                var item = ko.dataFor(ui.item[0]),
                    newIndex = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
                if (newIndex >= list().length) newIndex = list().length - 1;
                if (newIndex < 0) newIndex = 0;
        
                ui.item.remove();
                list.remove(item);
                list.splice(newIndex, 0, item);
            },
            activate: function( event, ui )
            {
                actionActivate(event, ui);
            },
            beforeStop: function( event, ui )
            {
                actionBeforeStop(event, ui);
            },
            change: function( event, ui )
            {
                actionChange(event, ui);
            },
            create: function( event, ui )
            {
                actionCreate(event, ui);
            },
            deactivate: function( event, ui )
            {
                actionDeactivate(event, ui);
            },
            out: function( event, ui )
            {
                actionOut(event, ui);
            },
            over: function( event, ui )
            {
                actionOver(event, ui);
            },
            receive: function( event, ui )
            {
                actionReceive(event, ui);
            },
            remove: function( event, ui )
            {
                actionRemove(event, ui);
            },
            sort: function( event, ui )
            {
                actionSort(event, ui);
            },
            start: function( event, ui )
            {
                actionStart(event, ui);
            },
            stop: function( event, ui )
            {
                actionStop(event, ui);
            }
        });
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.
    }
};

ko.bindingHandlers.filereader = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
        var 
            checker    = $(element)[0], 
            value      = valueAccessor(),
            fileResult = allBindings.get('result')||{};

        ko.utils.registerEventHandler(element, 'change',function()
        {
            if(checker.files && checker.files[0])
            {
                var FR = new FileReader();
                FR.onload = function(e)
                {
                    // fileResult(e.target.result);
                    value(e.target.result);
                    // value(checker.files[0]);
                }
                FR.readAsDataURL(checker.files[0]);
            }
        });


    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.
    }
};

ko.bindingHandlers.infinityscroll = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext)
    {
        var onendscreen = allBindings.get('onendscreen')||function(){};
        // valueAccessor is the observable who handle boolean to perform callback
        var canPerform = ko.utils.unwrapObservable(valueAccessor());
        $(element).scroll(function()
        {
            if(($(this).scrollTop() + $(this).innerHeight()) >=  $(this)[0].scrollHeight && !canPerform)
            {
                onendscreen();
            }
        });
    }
};
